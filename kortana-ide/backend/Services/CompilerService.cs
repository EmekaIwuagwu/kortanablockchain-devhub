using KortanaStudio.Backend.Models;
using System.Diagnostics;
using System.Text.Json;
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
            // Implementation mapping to a real solc execution
            // For now, we simulate the output of a successful solc run
            _logger.LogInformation("Simulating Solidity compilation...");
            
            await Task.Delay(500);

            var result = new CompilationResult
            {
                Status = "success",
                Timestamp = DateTime.UtcNow,
                Contracts = new List<CompiledContract>
                {
                    new CompiledContract
                    {
                        Name = ExtractContractName(request.SourceCode),
                        Bytecode = "0x608060405234801561001057600080fd5b50610150806100206000396000f3fe",
                        Abi = "[{\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]"
                    }
                }
            };

            return result;
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
