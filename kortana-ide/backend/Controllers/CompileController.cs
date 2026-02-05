using Microsoft.AspNetCore.Mvc;
using KortanaStudio.Backend.Models;
using KortanaStudio.Backend.Services;

namespace KortanaStudio.Backend.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CompileController : ControllerBase
    {
        private readonly ICompilerService _compilerService;
        private readonly ILogger<CompileController> _logger;

        public CompileController(ICompilerService compilerService, ILogger<CompileController> logger)
        {
            _compilerService = compilerService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Compile([FromBody] CompilationRequest request)
        {
            _logger.LogInformation($"Compilation requested for language: {request.Language}");

            try
            {
                var result = await _compilerService.CompileAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Compilation failed");
                return StatusCode(500, new { status = "error", message = ex.Message });
            }
        }

        [HttpPost("validate")]
        public async Task<IActionResult> Validate([FromBody] ValidationRequest request)
        {
            var isValid = await _compilerService.ValidateSyntaxAsync(request.SourceCode, request.Language);
            return Ok(new { isValid = isValid });
        }
    }
}
