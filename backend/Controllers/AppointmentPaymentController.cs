using System.Globalization;
using System.Text.Json;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;
using Server.DTOs;
using Server.Models;


namespace Server.Controllers
{
    [Route("api/appointment-payment")]
    [ApiController]
    public class AppointmentPaymentController : ControllerBase
    {
        private readonly AppDbContext _context;

        private readonly IHttpClientFactory
            _httpClientFactory;

        private readonly IConfiguration
            _configuration;


        // Fixed booking charge
        private const decimal BookingFee =
            50.00m;



        public AppointmentPaymentController(
            AppDbContext context,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration
        )
        {
            _context =
                context;

            _httpClientFactory =
                httpClientFactory;

            _configuration =
                configuration;
        }



        // =====================================================
        // INITIATE APPOINTMENT PAYMENT
        //
        // POST:
        // /api/appointment-payment/initiate
        // =====================================================

        [HttpPost("initiate")]
        public async Task<IActionResult> Initiate(
            AppointmentPaymentDto dto
        )
        {
            try
            {
                // =============================================
                // PATIENT
                // =============================================

                var patient =
                    await _context.Patients
                        .FirstOrDefaultAsync(
                            patient =>
                                patient.Id ==
                                dto.PatientId
                        );


                if (patient == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Patient not found."
                    });
                }


                if (!patient.IsVisible)
                {
                    return BadRequest(new
                    {
                        message =
                            "Patient account is unavailable."
                    });
                }



                // =============================================
                // DOCTOR
                // =============================================

                var doctor =
                    await _context.Doctors
                        .FirstOrDefaultAsync(
                            doctor =>
                                doctor.Id ==
                                dto.DoctorId
                        );


                if (doctor == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Doctor not found."
                    });
                }


                if (!doctor.IsVisible)
                {
                    return BadRequest(new
                    {
                        message =
                            "Doctor is currently unavailable."
                    });
                }



                // =============================================
                // DOCTOR SETTINGS
                // =============================================

                var doctorSettings =
                    await _context.DoctorSettings
                        .FirstOrDefaultAsync(
                            settings =>
                                settings.DoctorId ==
                                doctor.Id
                        );


                var consultationFee =
                    doctorSettings?.ConsultationFee;



                // =============================================
                // TRANSACTION ID
                // =============================================

                var transactionId =
                    "AP" +
                    Guid.NewGuid()
                        .ToString("N")
                        .Substring(
                            0,
                            20
                        )
                        .ToUpperInvariant();



                // =============================================
                // CREATE APPOINTMENT REQUEST
                // =============================================

                var request =
                    new AppointmentRequest
                    {
                        PatientId =
                            patient.Id,

                        DoctorId =
                            doctor.Id,

                        TransactionId =
                            transactionId,

                        BookingFee =
                            BookingFee,

                        ConsultationFee =
                            consultationFee,

                        PaymentStatus =
                            "Unpaid",

                        RequestStatus =
                            "Awaiting Payment",

                        CreatedAt =
                            DateTime.Now
                    };


                _context.AppointmentRequests.Add(
                    request
                );


                await _context.SaveChangesAsync();



                // =============================================
                // CREATE APPOINTMENT PAYMENT
                // =============================================

                var payment =
                    new AppointmentPayment
                    {
                        AppointmentRequestId =
                            request.Id,

                        TransactionId =
                            transactionId,

                        Amount =
                            BookingFee,

                        Currency =
                            "BDT",

                        Status =
                            "Initiated",

                        CreatedAt =
                            DateTime.Now
                    };


                _context.AppointmentPayments.Add(
                    payment
                );


                await _context.SaveChangesAsync();



                // =============================================
                // CONFIG
                // =============================================

                var storeId =
                    _configuration[
                        "SslCommerz:StoreId"
                    ];


                var storePassword =
                    _configuration[
                        "SslCommerz:StorePassword"
                    ];


                var sessionUrl =
                    _configuration[
                        "SslCommerz:SessionUrl"
                    ];


                var backendBaseUrl =
                    _configuration[
                        "SslCommerz:BackendBaseUrl"
                    ];



                if (
                    string.IsNullOrWhiteSpace(
                        storeId
                    )
                    ||
                    string.IsNullOrWhiteSpace(
                        storePassword
                    )
                    ||
                    string.IsNullOrWhiteSpace(
                        sessionUrl
                    )
                    ||
                    string.IsNullOrWhiteSpace(
                        backendBaseUrl
                    )
                )
                {
                    return StatusCode(
                        500,
                        new
                        {
                            message =
                                "Payment gateway configuration is missing."
                        }
                    );
                }



                // =============================================
                // DOCTOR NAME
                // =============================================

                var doctorName =
                    $"{doctor.Title} {doctor.FirstName} {doctor.LastName}"
                        .Trim();



                // =============================================
                // SSLCOMMERZ DATA
                // =============================================

                var formData =
                    new Dictionary<string, string>
                    {
                        ["store_id"] =
                            storeId,

                        ["store_passwd"] =
                            storePassword,

                        ["total_amount"] =
                            BookingFee.ToString(
                                "0.00",
                                CultureInfo.InvariantCulture
                            ),

                        ["currency"] =
                            "BDT",

                        ["tran_id"] =
                            transactionId,


                        // CALLBACKS

                        ["success_url"] =
                            $"{backendBaseUrl}/api/appointment-payment/success",

                        ["fail_url"] =
                            $"{backendBaseUrl}/api/appointment-payment/fail",

                        ["cancel_url"] =
                            $"{backendBaseUrl}/api/appointment-payment/cancel",


                        // CUSTOMER

                        ["cus_name"] =
                            patient.FullName,

                        ["cus_email"] =
                            patient.Email,

                        ["cus_add1"] =
                            string.IsNullOrWhiteSpace(
                                patient.Address
                            )
                                ? "Dhaka"
                                : patient.Address,

                        ["cus_city"] =
                            "Dhaka",

                        ["cus_state"] =
                            "Dhaka",

                        ["cus_postcode"] =
                            "1000",

                        ["cus_country"] =
                            "Bangladesh",

                        ["cus_phone"] =
                            string.IsNullOrWhiteSpace(
                                patient.Phone
                            )
                                ? "01700000000"
                                : patient.Phone,


                        // APPOINTMENT PRODUCT

                        ["shipping_method"] =
                            "NO",

                        ["product_name"] =
                            $"Online Appointment Booking - {doctorName}",

                        ["product_category"] =
                            "Healthcare Appointment",

                        ["product_profile"] =
                            "general",

                        ["num_of_item"] =
                            "1",

                        ["emi_option"] =
                            "0",


                        // OUR VALUES

                        ["value_a"] =
                            request.Id.ToString(),

                        ["value_b"] =
                            doctor.Id.ToString(),

                        ["value_c"] =
                            patient.Id.ToString()
                    };



                // =============================================
                // SEND TO SSLCOMMERZ
                // =============================================

                var client =
                    _httpClientFactory
                        .CreateClient();


                var response =
                    await client.PostAsync(
                        sessionUrl,
                        new FormUrlEncodedContent(
                            formData
                        )
                    );


                var responseText =
                    await response.Content
                        .ReadAsStringAsync();



                using var document =
                    JsonDocument.Parse(
                        responseText
                    );


                var root =
                    document.RootElement;


                var status =
                    GetJsonString(
                        root,
                        "status"
                    );


                var gatewayPageUrl =
                    GetJsonString(
                        root,
                        "GatewayPageURL"
                    );


                var sessionKey =
                    GetJsonString(
                        root,
                        "sessionkey"
                    );


                var failedReason =
                    GetJsonString(
                        root,
                        "failedreason"
                    );



                // =============================================
                // FAILED
                // =============================================

                if (
                    !string.Equals(
                        status,
                        "SUCCESS",
                        StringComparison.OrdinalIgnoreCase
                    )
                    ||
                    string.IsNullOrWhiteSpace(
                        gatewayPageUrl
                    )
                )
                {
                    request.PaymentStatus =
                        "Failed";

                    request.RequestStatus =
                        "Payment Failed";

                    payment.Status =
                        "Initiation Failed";


                    await _context.SaveChangesAsync();


                    return BadRequest(new
                    {
                        message =
                            string.IsNullOrWhiteSpace(
                                failedReason
                            )
                                ? "Could not create appointment payment."
                                : failedReason
                    });
                }



                // =============================================
                // SUCCESS SESSION
                // =============================================

                payment.SessionKey =
                    sessionKey;

                payment.Status =
                    "Pending";


                await _context.SaveChangesAsync();



                return Ok(new
                {
                    message =
                        "Appointment payment created.",

                    appointmentRequestId =
                        request.Id,

                    transactionId,

                    amount =
                        BookingFee,

                    paymentUrl =
                        gatewayPageUrl
                });
            }

            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Could not start appointment payment.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // SUCCESS CALLBACK
        // =====================================================

        [HttpPost("success")]
        public async Task<IActionResult> Success()
        {
            try
            {
                var form =
                    await Request
                        .ReadFormAsync();


                var transactionId =
                    form["tran_id"]
                        .ToString();


                var validationId =
                    form["val_id"]
                        .ToString();



                var valid =
                    await ValidateAndConfirm(
                        transactionId,
                        validationId
                    );



                if (!valid)
                {
                    return Redirect(
                        $"{GetFrontendUrl()}/patient-account?appointmentPayment=failed"
                    );
                }



                return Redirect(
                    $"{GetFrontendUrl()}/patient-account?appointmentPayment=success"
                );
            }

            catch
            {
                return Redirect(
                    $"{GetFrontendUrl()}/patient-account?appointmentPayment=failed"
                );
            }
        }



        // =====================================================
        // FAIL CALLBACK
        // =====================================================

        [HttpPost("fail")]
        public async Task<IActionResult> Fail()
        {
            var form =
                await Request
                    .ReadFormAsync();


            var transactionId =
                form["tran_id"]
                    .ToString();


            await MarkFailed(
                transactionId,
                "Failed"
            );


            return Redirect(
                $"{GetFrontendUrl()}/patient-account?appointmentPayment=failed"
            );
        }



        // =====================================================
        // CANCEL CALLBACK
        // =====================================================

        [HttpPost("cancel")]
        public async Task<IActionResult> Cancel()
        {
            var form =
                await Request
                    .ReadFormAsync();


            var transactionId =
                form["tran_id"]
                    .ToString();


            await MarkFailed(
                transactionId,
                "Cancelled"
            );


            return Redirect(
                $"{GetFrontendUrl()}/patient-account?appointmentPayment=cancelled"
            );
        }



        // =====================================================
        // VALIDATE AND CONFIRM
        // =====================================================

        private async Task<bool> ValidateAndConfirm(
            string transactionId,
            string validationId
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    transactionId
                )
                ||
                string.IsNullOrWhiteSpace(
                    validationId
                )
            )
            {
                return false;
            }



            var request =
                await _context.AppointmentRequests
                    .FirstOrDefaultAsync(
                        request =>
                            request.TransactionId ==
                            transactionId
                    );


            if (request == null)
            {
                return false;
            }



            if (
                request.PaymentStatus ==
                "Paid"
            )
            {
                return true;
            }



            var validation =
                await ValidateTransaction(
                    validationId
                );


            if (validation == null)
            {
                return false;
            }



            var validStatus =

                string.Equals(
                    validation.Status,
                    "VALID",
                    StringComparison.OrdinalIgnoreCase
                )

                ||

                string.Equals(
                    validation.Status,
                    "VALIDATED",
                    StringComparison.OrdinalIgnoreCase
                );



            if (!validStatus)
            {
                return false;
            }



            if (
                validation.TransactionId !=
                transactionId
            )
            {
                return false;
            }



            // Must be exactly ৳50

            if (
                Math.Abs(
                    validation.Amount -
                    BookingFee
                )
                >
                0.01m
            )
            {
                return false;
            }



            if (
                !string.Equals(
                    validation.Currency,
                    "BDT",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                return false;
            }



            var payment =
                await _context.AppointmentPayments
                    .FirstOrDefaultAsync(
                        payment =>
                            payment.AppointmentRequestId ==
                            request.Id
                    );


            if (payment == null)
            {
                return false;
            }



            // =============================================
            // CONFIRM PAYMENT
            // =============================================

            request.PaymentStatus =
                "Paid";


            request.RequestStatus =
                "Pending";


            request.PaidAt =
                DateTime.Now;



            payment.Status =
                "Paid";


            payment.ValidationId =
                validationId;


            payment.BankTransactionId =
                validation.BankTransactionId;


            payment.CardType =
                validation.CardType;


            payment.PaidAt =
                DateTime.Now;



            await _context.SaveChangesAsync();


            return true;
        }



        // =====================================================
        // VALIDATION API
        // =====================================================

        private async Task<ValidationData?>
            ValidateTransaction(
                string validationId
            )
        {
            var storeId =
                _configuration[
                    "SslCommerz:StoreId"
                ];


            var storePassword =
                _configuration[
                    "SslCommerz:StorePassword"
                ];


            var validationUrl =
                _configuration[
                    "SslCommerz:ValidationUrl"
                ];



            if (
                string.IsNullOrWhiteSpace(
                    storeId
                )
                ||
                string.IsNullOrWhiteSpace(
                    storePassword
                )
                ||
                string.IsNullOrWhiteSpace(
                    validationUrl
                )
            )
            {
                return null;
            }



            var url =
                validationUrl

                +

                $"?val_id={Uri.EscapeDataString(validationId)}"

                +

                $"&store_id={Uri.EscapeDataString(storeId)}"

                +

                $"&store_passwd={Uri.EscapeDataString(storePassword)}"

                +

                "&v=1"

                +

                "&format=json";



            var client =
                _httpClientFactory
                    .CreateClient();



            var response =
                await client.GetAsync(
                    url
                );


            if (
                !response.IsSuccessStatusCode
            )
            {
                return null;
            }



            var json =
                await response.Content
                    .ReadAsStringAsync();



            using var document =
                JsonDocument.Parse(
                    json
                );


            var root =
                document.RootElement;



            var amountString =
                GetJsonString(
                    root,
                    "amount"
                );


            if (
                !decimal.TryParse(
                    amountString,
                    NumberStyles.Any,
                    CultureInfo.InvariantCulture,
                    out var amount
                )
            )
            {
                return null;
            }



            return new ValidationData
            {
                Status =
                    GetJsonString(
                        root,
                        "status"
                    ),

                TransactionId =
                    GetJsonString(
                        root,
                        "tran_id"
                    ),

                Amount =
                    amount,

                Currency =
                    GetJsonString(
                        root,
                        "currency"
                    ),

                BankTransactionId =
                    GetJsonString(
                        root,
                        "bank_tran_id"
                    ),

                CardType =
                    GetJsonString(
                        root,
                        "card_type"
                    )
            };
        }



        // =====================================================
        // FAIL/CANCEL
        // =====================================================

        private async Task MarkFailed(
            string transactionId,
            string status
        )
        {
            var request =
                await _context.AppointmentRequests
                    .FirstOrDefaultAsync(
                        request =>
                            request.TransactionId ==
                            transactionId
                    );


            if (request == null)
            {
                return;
            }


            if (
                request.PaymentStatus ==
                "Paid"
            )
            {
                return;
            }



            var payment =
                await _context.AppointmentPayments
                    .FirstOrDefaultAsync(
                        payment =>
                            payment.AppointmentRequestId ==
                            request.Id
                    );



            request.PaymentStatus =
                status;


            request.RequestStatus =
                status ==
                "Cancelled"
                    ? "Cancelled"
                    : "Payment Failed";


            if (payment != null)
            {
                payment.Status =
                    status;
            }



            await _context.SaveChangesAsync();
        }



        private string GetFrontendUrl()
        {
            return
                _configuration[
                    "SslCommerz:FrontendBaseUrl"
                ]
                ??
                "http://localhost:5173";
        }



        private static string GetJsonString(
            JsonElement element,
            string property
        )
        {
            if (
                element.TryGetProperty(
                    property,
                    out var result
                )
            )
            {
                return result.ToString();
            }


            return "";
        }



        private class ValidationData
        {
            public string Status { get; set; }
                = "";


            public string TransactionId { get; set; }
                = "";


            public decimal Amount { get; set; }


            public string Currency { get; set; }
                = "";


            public string BankTransactionId { get; set; }
                = "";


            public string CardType { get; set; }
                = "";
        }
    }
}