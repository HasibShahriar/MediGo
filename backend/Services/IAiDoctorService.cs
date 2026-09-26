using Server.DTOs;

namespace Server.Services
{
    public interface IAiDoctorService
    {
        Task<AiDoctorDecisionDto>
            AnalyzeConversationAsync(
                IReadOnlyList<AiChatMessageDto> messages,
                CancellationToken cancellationToken = default
            );
    }
}