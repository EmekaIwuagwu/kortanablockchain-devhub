using KortanaStudio.Backend.Models;
using System.Diagnostics;
using System.Text.Json;
using System.Linq;
using System.IO;
using Microsoft.Extensions.Logging;

namespace KortanaStudio.Backend.Services
{
    public interface ICompilerService
    {
        Task<CompilationResult> CompileAsync(CompilationRequest request);
        Task<bool> ValidateSyntaxAsync(string sourceCode, string language);
    }

    public class CompilerService : ICompilerService
    {
        private readonly ILogger<CompilerService> _logger;
        private readonly string _workingDir;

        public CompilerService(ILogger<CompilerService> logger)
        {
            _logger = logger;
            _workingDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "compilers");
            if (!Directory.Exists(_workingDir)) Directory.CreateDirectory(_workingDir);
        }

        public async Task<CompilationResult> CompileAsync(CompilationRequest request)
        {
            _logger.LogInformation($"Backend: Starting compilation for {request.Language}");
            
            var result = new CompilationResult
            {
                Status = "success",
                Timestamp = DateTime.UtcNow,
                Contracts = new List<CompiledContract>(),
                Errors = new List<CompilationError>()
            };

            try
            {
                if (request.Language.ToLower() == "solidity")
                {
                    return await CompileSolidityAsync(request);
                }
                else if (request.Language.ToLower() == "quorlin")
                {
                    return await CompileQuorlinAsync(request);
                }
                else
                {
                    throw new Exception($"Unsupported language: {request.Language}");
                }
            }
            catch (Exception ex)
            {
                result.Status = "error";
                result.Errors.Add(new CompilationError { Severity = "error", Message = ex.Message });
                return result;
            }
        }

        private async Task<CompilationResult> CompileSolidityAsync(CompilationRequest request)
        {
            _logger.LogInformation("Attempting production Solidity compilation via solc...");
            string tempFile = null;
            
            try 
            {
                // Create a temporary file for the source code
                tempFile = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.sol");
                await File.WriteAllTextAsync(tempFile, request.SourceCode);

                var startInfo = new ProcessStartInfo
                {
                    FileName = "solc",
                    Arguments = $"--combined-json abi,bin,bin-runtime {tempFile}",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = Process.Start(startInfo);
                if (process == null) throw new Exception("Failed to start solc process.");

                string output = await process.StandardOutput.ReadToEndAsync();
                string error = await process.StandardError.ReadToEndAsync();
                await process.WaitForExitAsync();

                if (process.ExitCode != 0)
                {
                     _logger.LogWarning($"solc failed: {error}");
                     return new CompilationResult { 
                         Status = "error", 
                         Errors = new List<CompilationError> { new CompilationError { Severity = "error", Message = $"Solidity Error: {error}" } } 
                     };
                }

                // Parse standard solc output
                var json = JsonDocument.Parse(output);
                var contracts = json.RootElement.GetProperty("contracts");
                
                var results = new List<CompiledContract>();
                foreach (var contractProperty in contracts.EnumerateObject())
                {
                    string fullName = contractProperty.Name;
                    string name = fullName.Split(':').Last();
                    
                    // CRITICAL FIX: ABI is returned as a JSON object/array, not a string in the combine-json output.
                    // We must use GetRawText() to capture the actual JSON structure.
                    results.Add(new CompiledContract {
                        Name = name,
                        Bytecode = "0x" + contractProperty.Value.GetProperty("bin").GetString(),
                        Abi = contractProperty.Value.GetProperty("abi").GetRawText()
                    });
                }

                return new CompilationResult { 
                    Status = "success", 
                    Contracts = results.OrderByDescending(c => c.Bytecode.Length).ToList() 
                };
            }
            finally 
            {
                // Cleanup temp file
                try { if (tempFile != null && File.Exists(tempFile)) File.Delete(tempFile); } catch { /* ignore */ }
            }
        }

        private async Task<CompilationResult> CompileQuorlinAsync(CompilationRequest request)
        {
            _logger.LogInformation("Simulating Quorlin compilation...");
            await Task.Delay(400);

            return new CompilationResult
            {
                Status = "success",
                Timestamp = DateTime.UtcNow,
                Contracts = new List<CompiledContract>
                {
                    new CompiledContract
                    {
                        Name = ExtractContractName(request.SourceCode),
                        Bytecode = "0xQRL_MOCK_BYTECODE_72511",
                        Abi = "[]"
                    }
                }
            };
        }

        public Task<bool> ValidateSyntaxAsync(string sourceCode, string language)
        {
            return Task.FromResult(true);
        }

        private string ExtractContractName(string source)
        {
            if (string.IsNullOrEmpty(source)) return "Contract";
            
            var lines = source.Split('\n');
            foreach (var line in lines)
            {
                var trimmed = line.Trim();
                if (trimmed.StartsWith("contract "))
                {
                    var parts = trimmed.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length >= 2) return parts[1].Replace("{", "").Trim();
                }
            }
            return "Contract";
        }
    }
}
