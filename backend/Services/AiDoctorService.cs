using System.Net.Http.Json;
using System.Text.Json;

using Server.DTOs;


namespace Server.Services
{
    public class AiDoctorService : IAiDoctorService
    {
        // =====================================================
        // DEPENDENCIES
        // =====================================================

        private readonly HttpClient _httpClient;

        private readonly string _apiKey;

        private readonly string _model;

        private readonly string _baseUrl;


        // =====================================================
        // MEDIGO SUPPORTED SPECIALTIES
        // =====================================================

        private static readonly string[] SpecialtyValues =
        {
            "",
            "general-physician",
            "pediatrics",
            "gyne-obs",
            "dermatology",
            "internal-medicine",
            "cardiology",
            "neurology",
            "dentistry",
            "ophthalmology",
            "oncology",
            "family-medicine",
            "physical-medicine"
        };


        // =====================================================
        // SYSTEM PROMPT
        // =====================================================

        private const string SystemPrompt = """
You are MediGo AI Doctor Finder.

Your purpose is to help visitors find an appropriate medical
specialty available on the MediGo healthcare platform.

You are a healthcare navigation assistant.

You are NOT a doctor.

Follow these rules carefully.


GENERAL RULES

1. Do not diagnose diseases.

2. Do not tell the visitor that they definitely have a
   particular disease.

3. Do not prescribe medicine.

4. Do not recommend medicine doses.

5. Do not provide treatment plans.

6. Do not invent medical test results.

7. Your main job is to identify the most appropriate MediGo
   medical specialty based on the visitor's concern.


MEDIGO SPECIALTIES

The ONLY specialties available in MediGo are:

general-physician
pediatrics
gyne-obs
dermatology
internal-medicine
cardiology
neurology
dentistry
ophthalmology
oncology
family-medicine
physical-medicine

Never return a specialty outside this list.


FOLLOW-UP QUESTIONS

If there is not enough information to select a specialty,
ask ONE short and useful follow-up question.

Do not ask unnecessary questions.

When asking another question:

needs_more_information = true
specialty = ""

When enough information exists:

needs_more_information = false


GENERAL PHYSICIAN

If symptoms are common, broad, or unclear and no specialist
is clearly indicated, prefer:

general-physician


INTERNAL MEDICINE

internal-medicine may be used for adult internal medical
concerns when appropriate.


ONCOLOGY

Do NOT select oncology simply because a symptom could
theoretically be associated with cancer.

Use oncology mainly when:

- the visitor already has a cancer diagnosis,
- the visitor is currently receiving cancer treatment,
- the visitor explicitly requests an oncologist.


DIRECT SPECIALTY REQUESTS

If the visitor directly requests a type of specialist,
you may select that specialty.

Examples:

"I need a dermatologist"
specialty = dermatology

"I need a heart doctor"
specialty = cardiology

"I need an eye doctor"
specialty = ophthalmology

"I need a dentist"
specialty = dentistry

"I need a children's doctor"
specialty = pediatrics


DOCTOR GENDER PREFERENCE

Only extract a doctor gender preference when the visitor
explicitly states one.

Examples:

"I prefer a female doctor"
preferred_gender = female

"I need a male doctor"
preferred_gender = male

If no preference exists:

preferred_gender = any

Never infer doctor gender preference from the patient's
gender, symptoms, age, or condition.


CONSULTATION FEE

Extract maximum consultation fee only when explicitly stated.

Examples:

"under 1000 taka"
max_fee = 1000

"maximum 1500 BDT"
max_fee = 1500

"doctor within 800 taka"
max_fee = 800

If there is no budget:

max_fee = 0


LOCATION / WORKING PLACE

Extract a location or working-place preference only when
explicitly provided.

Example:

"I want a doctor in Dhanmondi"
working_place_keyword = Dhanmondi

"I need someone from Square Hospital"
working_place_keyword = Square Hospital

If no location preference exists:

working_place_keyword = ""


URGENCY

urgency MUST be exactly one of:

routine
soon
urgent
emergency


EMERGENCY

Possible emergency warning signs include:

- severe difficulty breathing
- inability to breathe
- severe chest pain with breathing difficulty
- unconsciousness
- severe uncontrolled bleeding
- stroke-like symptoms
- face drooping
- slurred speech
- sudden one-sided weakness
- severe seizure
- overdose
- immediate self-harm risk

When emergency warning signs are present:

urgency = emergency

Tell the visitor to seek immediate emergency medical care.

Do not tell an emergency visitor to wait for a normal
MediGo appointment.


DOCTOR RESULTS

Never invent:

- doctor names
- doctor qualifications
- doctor workplaces
- doctor experience
- consultation fees
- doctor availability

The MediGo ASP.NET backend will search the real database
after you determine:

- specialty
- urgency
- gender preference
- maximum fee
- location preference

Never claim that one doctor is medically superior to every
other doctor.

The backend will rank doctors using real MediGo data.


STYLE

Keep assistant_message:

- short
- friendly
- calm
- easy to understand
- non-diagnostic

specialty_reason must be a short non-diagnostic explanation
of why the specialty may be appropriate.


UNRELATED QUESTIONS

If the visitor asks something unrelated to healthcare or
finding a doctor, briefly explain that you are the MediGo
Doctor Finder and can help them find an appropriate doctor.


OUTPUT

Return exactly these fields:

assistant_message
needs_more_information
specialty
specialty_reason
urgency
preferred_gender
max_fee
working_place_keyword
""";


        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public AiDoctorService(
            HttpClient httpClient,
            IConfiguration configuration
        )
        {
            _httpClient =
                httpClient;


            _apiKey =
                configuration[
                    "Gemini:ApiKey"
                ]
                ?? "";


            _model =
                configuration[
                    "Gemini:Model"
                ]
                ?? "gemini-3.8-flash";


            _baseUrl =
                configuration[
                    "Gemini:BaseUrl"
                ]
                ??
                "https://generativelanguage.googleapis.com/v1beta";
        }


        // =====================================================
        // ANALYZE CONVERSATION
        // =====================================================

        public async Task<AiDoctorDecisionDto>
            AnalyzeConversationAsync(
                IReadOnlyList<AiChatMessageDto> messages,
                CancellationToken cancellationToken = default
            )
        {
            // =================================================
            // CHECK API KEY
            // =================================================

            if (
                string.IsNullOrWhiteSpace(
                    _apiKey
                )
            )
            {
                throw new InvalidOperationException(
                    "Gemini API key is not configured."
                );
            }


            // =================================================
            // CHECK CHAT
            // =================================================

            if (
                messages == null
                ||
                messages.Count == 0
            )
            {
                throw new InvalidOperationException(
                    "No chat messages were provided."
                );
            }


            // =================================================
            // BUILD GEMINI CHAT CONTENTS
            //
            // MediGo:
            // user
            // assistant
            //
            // Gemini:
            // user
            // model
            // =================================================

            var contents =
                new List<object>();


            foreach (
                var message
                in messages
            )
            {
                if (
                    message == null
                    ||
                    string.IsNullOrWhiteSpace(
                        message.Content
                    )
                )
                {
                    continue;
                }


                var role =
                    message.Role
                        ?.Trim()
                        .ToLowerInvariant();


                string geminiRole;


                if (
                    role == "user"
                )
                {
                    geminiRole =
                        "user";
                }

                else if (
                    role == "assistant"
                )
                {
                    geminiRole =
                        "model";
                }

                else
                {
                    continue;
                }


                contents.Add(
                    new
                    {
                        role =
                            geminiRole,

                        parts =
                            new[]
                            {
                                new
                                {
                                    text =
                                        message.Content.Trim()
                                }
                            }
                    }
                );
            }


            // =================================================
            // NO VALID CONTENT
            // =================================================

            if (
                contents.Count == 0
            )
            {
                throw new InvalidOperationException(
                    "No valid chat messages were provided."
                );
            }


            // =================================================
            // STRUCTURED OUTPUT SCHEMA
            // =====================================================

            var schema =
                new Dictionary<string, object>
                {
                    ["type"] =
                        "object",


                    ["properties"] =
                        new Dictionary<string, object>
                        {
                            // =================================
                            // ASSISTANT MESSAGE
                            // =================================

                            ["assistant_message"] =
                                new Dictionary<string, object>
                                {
                                    ["type"] =
                                        "string"
                                },


                            // =================================
                            // NEED MORE INFORMATION?
                            // =================================

                            ["needs_more_information"] =
                                new Dictionary<string, object>
                                {
                                    ["type"] =
                                        "boolean"
                                },


                            // =================================
                            // SPECIALTY
                            // =================================

                            ["specialty"] =
                                new Dictionary<string, object>
                                {
                                    ["type"] =
                                        "string",

                                    ["enum"] =
                                        SpecialtyValues
                                },


                            // =================================
                            // REASON
                            // =================================

                            ["specialty_reason"] =
                                new Dictionary<string, object>
                                {
                                    ["type"] =
                                        "string"
                                },


                            // =================================
                            // URGENCY
                            // =================================

                            ["urgency"] =
                                new Dictionary<string, object>
                                {
                                    ["type"] =
                                        "string",

                                    ["enum"] =
                                        new[]
                                        {
                                            "routine",
                                            "soon",
                                            "urgent",
                                            "emergency"
                                        }
                                },


                            // =================================
                            // PREFERRED DOCTOR GENDER
                            // =================================

                            ["preferred_gender"] =
                                new Dictionary<string, object>
                                {
                                    ["type"] =
                                        "string",

                                    ["enum"] =
                                        new[]
                                        {
                                            "any",
                                            "male",
                                            "female"
                                        }
                                },


                            // =================================
                            // MAXIMUM CONSULTATION FEE
                            // =================================

                            ["max_fee"] =
                                new Dictionary<string, object>
                                {
                                    ["type"] =
                                        "number",

                                    ["minimum"] =
                                        0
                                },


                            // =================================
                            // LOCATION / WORKPLACE
                            // =================================

                            ["working_place_keyword"] =
                                new Dictionary<string, object>
                                {
                                    ["type"] =
                                        "string"
                                }
                        },


                    // =========================================
                    // REQUIRED OUTPUT FIELDS
                    // =========================================

                    ["required"] =
                        new[]
                        {
                            "assistant_message",
                            "needs_more_information",
                            "specialty",
                            "specialty_reason",
                            "urgency",
                            "preferred_gender",
                            "max_fee",
                            "working_place_keyword"
                        },


                    // =========================================
                    // DO NOT ALLOW RANDOM EXTRA PROPERTIES
                    // =========================================

                    ["additionalProperties"] =
                        false
                };


            // =================================================
            // GEMINI REQUEST BODY
            // =====================================================

            var requestBody =
                new
                {
                    // =========================================
                    // SYSTEM INSTRUCTION
                    // =========================================

                    systemInstruction =
                        new
                        {
                            parts =
                                new[]
                                {
                                    new
                                    {
                                        text =
                                            SystemPrompt
                                    }
                                }
                        },


                    // =========================================
                    // CONVERSATION HISTORY
                    // =========================================

                    contents =
                        contents,


                    // =========================================
                    // GENERATION CONFIG
                    // =========================================

                    generationConfig =
                        new
                        {
                            // =================================
                            // OUTPUT LIMIT
                            // =================================

                            maxOutputTokens =
                                1200,


                            // =================================
                            // STRUCTURED JSON OUTPUT
                            //
                            // IMPORTANT:
                            //
                            // Gemini's new responseFormat
                            // TextResponseFormat expects:
                            //
                            // APPLICATION_JSON
                            //
                            // NOT:
                            //
                            // application/json
                            // =================================

                            responseFormat =
                                new
                                {
                                    text =
                                        new
                                        {
                                            mimeType =
                                                "APPLICATION_JSON",

                                            schema =
                                                schema
                                        }
                                }
                        }
                };


            // =================================================
            // ENDPOINT
            // =====================================================

            var endpoint =
                $"{_baseUrl}/models/{_model}:generateContent";


            // =================================================
            // HTTP REQUEST
            // =====================================================

            using var request =
                new HttpRequestMessage(
                    HttpMethod.Post,
                    endpoint
                );


            // =================================================
            // GEMINI API KEY
            // =====================================================

            request.Headers.Add(
                "x-goog-api-key",
                _apiKey
            );


            // =================================================
            // JSON REQUEST BODY
            // =====================================================

            request.Content =
                JsonContent.Create(
                    requestBody
                );


            // =================================================
            // SEND REQUEST
            // =====================================================

            using var response =
                await _httpClient
                    .SendAsync(
                        request,
                        cancellationToken
                    );


            // =================================================
            // READ RAW RESPONSE
            // =====================================================

            var responseJson =
                await response.Content
                    .ReadAsStringAsync(
                        cancellationToken
                    );


            // =================================================
            // GEMINI API ERROR
            // =====================================================

            if (
                !response.IsSuccessStatusCode
            )
            {
                Console.WriteLine(
                    "===================================="
                );

                Console.WriteLine(
                    "GEMINI API ERROR"
                );

                Console.WriteLine(
                    $"HTTP STATUS: {(int)response.StatusCode}"
                );

                Console.WriteLine(
                    responseJson
                );

                Console.WriteLine(
                    "===================================="
                );


                throw new InvalidOperationException(
                    $"Gemini API returned HTTP {(int)response.StatusCode}."
                );
            }


            // =================================================
            // PARSE MAIN GEMINI RESPONSE
            // =====================================================

            JsonDocument document;


            try
            {
                document =
                    JsonDocument.Parse(
                        responseJson
                    );
            }

            catch (
                JsonException ex
            )
            {
                Console.WriteLine(
                    "===================================="
                );

                Console.WriteLine(
                    "INVALID GEMINI RESPONSE"
                );

                Console.WriteLine(
                    responseJson
                );

                Console.WriteLine(
                    "===================================="
                );


                throw new InvalidOperationException(
                    "Gemini returned invalid response JSON.",
                    ex
                );
            }


            using (
                document
            )
            {
                // =============================================
                // GET GENERATED JSON TEXT
                // =============================================

                var outputText =
                    ExtractGeminiText(
                        document.RootElement
                    );


                // =============================================
                // NO OUTPUT
                // =============================================

                if (
                    string.IsNullOrWhiteSpace(
                        outputText
                    )
                )
                {
                    Console.WriteLine(
                        "===================================="
                    );

                    Console.WriteLine(
                        "GEMINI RETURNED NO USABLE TEXT"
                    );

                    Console.WriteLine(
                        responseJson
                    );

                    Console.WriteLine(
                        "===================================="
                    );


                    throw new InvalidOperationException(
                        "Gemini returned no usable response."
                    );
                }


                // =============================================
                // DEBUG OUTPUT
                //
                // Useful while developing MediGo.
                // You can remove this later.
                // =============================================

                Console.WriteLine(
                    "===================================="
                );

                Console.WriteLine(
                    "GEMINI RESPONSE"
                );

                Console.WriteLine(
                    outputText
                );

                Console.WriteLine(
                    "===================================="
                );


                // =============================================
                // DESERIALIZE GEMINI JSON
                // =============================================

                AiDoctorDecisionDto?
                    decision;


                try
                {
                    decision =
                        JsonSerializer.Deserialize
                        <AiDoctorDecisionDto>(
                            outputText,

                            new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive =
                                    true
                            }
                        );
                }

                catch (
                    JsonException ex
                )
                {
                    Console.WriteLine(
                        "===================================="
                    );

                    Console.WriteLine(
                        "GEMINI OUTPUT PARSE ERROR"
                    );

                    Console.WriteLine(
                        outputText
                    );

                    Console.WriteLine(
                        "===================================="
                    );


                    throw new InvalidOperationException(
                        "Could not parse Gemini structured output.",
                        ex
                    );
                }


                // =============================================
                // NULL RESULT
                // =============================================

                if (
                    decision == null
                )
                {
                    throw new InvalidOperationException(
                        "Gemini returned an empty decision."
                    );
                }


                // =================================================
                // NORMALIZE ASSISTANT MESSAGE
                // =================================================

                decision.AssistantMessage =
                    decision.AssistantMessage
                        ?.Trim()
                    ??
                    "";


                // =================================================
                // NORMALIZE SPECIALTY
                // =================================================

                decision.Specialty =
                    decision.Specialty
                        ?.Trim()
                        .ToLowerInvariant()
                    ??
                    "";


                // =================================================
                // NORMALIZE REASON
                // =================================================

                decision.SpecialtyReason =
                    decision.SpecialtyReason
                        ?.Trim()
                    ??
                    "";


                // =================================================
                // NORMALIZE URGENCY
                // =================================================

                decision.Urgency =
                    decision.Urgency
                        ?.Trim()
                        .ToLowerInvariant()
                    ??
                    "routine";


                // =================================================
                // NORMALIZE GENDER
                // =================================================

                decision.PreferredGender =
                    decision.PreferredGender
                        ?.Trim()
                        .ToLowerInvariant()
                    ??
                    "any";


                // =================================================
                // NORMALIZE LOCATION
                // =================================================

                decision.WorkingPlaceKeyword =
                    decision.WorkingPlaceKeyword
                        ?.Trim()
                    ??
                    "";


                // =================================================
                // VALIDATE SPECIALTY
                // =================================================

                if (
                    !SpecialtyValues.Contains(
                        decision.Specialty,
                        StringComparer.OrdinalIgnoreCase
                    )
                )
                {
                    decision.Specialty =
                        "";
                }


                // =================================================
                // VALIDATE URGENCY
                // =================================================

                var allowedUrgencies =
                    new[]
                    {
                        "routine",
                        "soon",
                        "urgent",
                        "emergency"
                    };


                if (
                    !allowedUrgencies.Contains(
                        decision.Urgency,
                        StringComparer.OrdinalIgnoreCase
                    )
                )
                {
                    decision.Urgency =
                        "routine";
                }


                // =================================================
                // VALIDATE GENDER
                // =================================================

                var allowedGenders =
                    new[]
                    {
                        "any",
                        "male",
                        "female"
                    };


                if (
                    !allowedGenders.Contains(
                        decision.PreferredGender,
                        StringComparer.OrdinalIgnoreCase
                    )
                )
                {
                    decision.PreferredGender =
                        "any";
                }


                // =================================================
                // VALIDATE MAX FEE
                // =================================================

                if (
                    decision.MaxFee < 0
                )
                {
                    decision.MaxFee =
                        0;
                }


                // =================================================
                // IF MORE INFORMATION IS REQUIRED,
                // DO NOT ALLOW A SPECIALTY TO BE SELECTED
                // =================================================

                if (
                    decision.NeedsMoreInformation
                )
                {
                    decision.Specialty =
                        "";
                }


                // =================================================
                // EMERGENCY MESSAGE SAFETY
                // =================================================

                if (
                    decision.Urgency ==
                    "emergency"
                )
                {
                    decision.NeedsMoreInformation =
                        false;

                    decision.Specialty =
                        "";
                }


                // =================================================
                // DEFAULT MESSAGE IF GEMINI SOMEHOW RETURNS EMPTY
                // =================================================

                if (
                    string.IsNullOrWhiteSpace(
                        decision.AssistantMessage
                    )
                )
                {
                    if (
                        decision.NeedsMoreInformation
                    )
                    {
                        decision.AssistantMessage =
                            "Could you tell me a little more about your symptoms?";
                    }

                    else if (
                        decision.Urgency ==
                        "emergency"
                    )
                    {
                        decision.AssistantMessage =
                            "Your symptoms may require urgent medical attention. Please seek emergency medical care immediately.";
                    }

                    else
                    {
                        decision.AssistantMessage =
                            "I can help you find an appropriate MediGo doctor.";
                    }
                }


                // =================================================
                // RETURN TO CONTROLLER
                // =================================================

                return decision;
            }
        }


        // =====================================================
        // EXTRACT GENERATED TEXT FROM GEMINI RESPONSE
        //
        // Gemini response:
        //
        // candidates
        //    ↓
        // content
        //    ↓
        // parts
        //    ↓
        // text
        // =====================================================

        private static string?
            ExtractGeminiText(
                JsonElement root
            )
        {
            // =================================================
            // FIND CANDIDATES
            // =================================================

            if (
                !root.TryGetProperty(
                    "candidates",
                    out var candidates
                )
            )
            {
                return null;
            }


            if (
                candidates.ValueKind
                != JsonValueKind.Array
            )
            {
                return null;
            }


            if (
                candidates.GetArrayLength()
                == 0
            )
            {
                return null;
            }


            // =================================================
            // FIRST CANDIDATE
            // =================================================

            var firstCandidate =
                candidates[0];


            // =================================================
            // CONTENT
            // =================================================

            if (
                !firstCandidate.TryGetProperty(
                    "content",
                    out var content
                )
            )
            {
                return null;
            }


            // =================================================
            // PARTS
            // =================================================

            if (
                !content.TryGetProperty(
                    "parts",
                    out var parts
                )
            )
            {
                return null;
            }


            if (
                parts.ValueKind
                != JsonValueKind.Array
            )
            {
                return null;
            }


            // =================================================
            // COLLECT TEXT PARTS
            // =================================================

            var textParts =
                new List<string>();


            foreach (
                var part
                in parts.EnumerateArray()
            )
            {
                if (
                    !part.TryGetProperty(
                        "text",
                        out var textElement
                    )
                )
                {
                    continue;
                }


                if (
                    textElement.ValueKind
                    != JsonValueKind.String
                )
                {
                    continue;
                }


                var value =
                    textElement.GetString();


                if (
                    !string.IsNullOrWhiteSpace(
                        value
                    )
                )
                {
                    textParts.Add(
                        value
                    );
                }
            }


            // =================================================
            // NOTHING FOUND
            // =================================================

            if (
                textParts.Count == 0
            )
            {
                return null;
            }


            // =================================================
            // JOIN ALL TEXT
            // =================================================

            return string.Join(
                "",
                textParts
            );
        }
    }
}