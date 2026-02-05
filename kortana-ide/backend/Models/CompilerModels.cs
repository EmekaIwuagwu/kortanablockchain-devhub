using System;

namespace KortanaStudio.Backend.Models
{
    public class CompilationRequest
    {
        public string Language { get; set; } = "solidity";
        public string SourceCode { get; set; } = string.Empty;
        public string Version { get; set; } = "0.8.19";
    }

    public class ValidationRequest
    {
        public string Language { get; set; } = "solidity";
        public string SourceCode { get; set; } = string.Empty;
    }

    public class CompilationResult
    {
        public string Status { get; set; } = "success";
        public DateTime Timestamp { get; set; }
        public List<CompiledContract> Contracts { get; set; } = new();
        public List<CompilationError> Errors { get; set; } = new();
    }

    public class CompiledContract
    {
        public string Name { get; set; } = string.Empty;
        public string Abi { get; set; } = "[]";
        public string Bytecode { get; set; } = string.Empty;
    }

    public class CompilationError
    {
        public string Severity { get; set; } = "error";
        public string Message { get; set; } = string.Empty;
        public int Line { get; set; }
        public int Column { get; set; }
        public string File { get; set; } = "root";
    }
}
