using System.Globalization;
using System.Text.Json;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Server.Data;
using Server.DTOs;
using Server.Models;


namespace Server.Controllers
{
    [Route("api/payment")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;

        private readonly IHttpClientFactory
            _httpClientFactory;

        private readonly IConfiguration
            _configuration;



        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public PaymentController(
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
        // INITIATE PAYMENT
        //
        // POST:
        // /api/payment/initiate
        //
        // React sends only PatientId.
        //
        // Backend:
        // 1. Reads cart
        // 2. Calculates real price
        // 3. Creates Order
        // 4. Creates OrderItems snapshot
        // 5. Creates Payment
        // 6. Creates SSLCOMMERZ session
        // =====================================================

        [HttpPost("initiate")]
        public async Task<IActionResult> InitiatePayment(
            InitiatePaymentDto dto
        )
        {
            try
            {
                // =============================================
                // VALIDATE PATIENT ID
                // =============================================

                if (dto.PatientId <= 0)
                {
                    return BadRequest(new
                    {
                        message =
                            "Invalid patient."
                    });
                }



                // =============================================
                // PATIENT
                // =============================================

                var patient =
                    await _context.Patients
                        .FirstOrDefaultAsync(
                            p =>
                                p.Id ==
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
                // GET CART + MEDICINE DATA
                // =============================================

                var cart =
                    await (
                        from cartItem
                        in _context.CartItems

                        join medicine
                        in _context.Medicines

                        on cartItem.MedicineId
                        equals medicine.Id

                        where
                            cartItem.PatientId ==
                            patient.Id

                        select new
                        {
                            CartItemId =
                                cartItem.Id,

                            MedicineId =
                                medicine.Id,

                            MedicineName =
                                medicine.Name,

                            GenericName =
                                medicine.GenericName,

                            Strength =
                                medicine.Strength,

                            Price =
                                medicine.Price,

                            Quantity =
                                cartItem.Quantity
                        }
                    )
                    .ToListAsync();



                // =============================================
                // EMPTY CART
                // =============================================

                if (
                    cart.Count ==
                    0
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Your cart is empty."
                    });
                }



                // =============================================
                // CALCULATE TOTAL FROM DATABASE
                // =============================================

                var totalAmount =
                    cart.Sum(
                        item =>
                            item.Price *
                            item.Quantity
                    );



                // SSLCOMMERZ documented range:
                // 10 - 500000 BDT.

                if (
                    totalAmount <
                    10
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Payment amount must be at least ৳10."
                    });
                }


                if (
                    totalAmount >
                    500000
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Payment amount is too high."
                    });
                }



                // =============================================
                // IDs
                // =============================================

                var orderNumber =
                    "MED-" +
                    Guid.NewGuid()
                        .ToString("N")
                        .Substring(
                            0,
                            12
                        )
                        .ToUpperInvariant();


                var transactionId =
                    "MG" +
                    Guid.NewGuid()
                        .ToString("N")
                        .Substring(
                            0,
                            20
                        )
                        .ToUpperInvariant();



                // =============================================
                // CREATE ORDER
                // =============================================

                var order =
                    new Order
                    {
                        PatientId =
                            patient.Id,

                        OrderNumber =
                            orderNumber,

                        TransactionId =
                            transactionId,

                        TotalAmount =
                            totalAmount,

                        OrderStatus =
                            "Awaiting Payment",

                        PaymentStatus =
                            "Unpaid",

                        CreatedAt =
                            DateTime.Now
                    };


                _context.Orders.Add(
                    order
                );


                await _context.SaveChangesAsync();



                // =============================================
                // CREATE ORDER ITEM SNAPSHOT
                // =============================================

                foreach (
                    var cartItem
                    in cart
                )
                {
                    var orderItem =
                        new OrderItem
                        {
                            OrderId =
                                order.Id,

                            MedicineId =
                                cartItem.MedicineId,

                            MedicineName =
                                cartItem.MedicineName,

                            GenericName =
                                cartItem.GenericName,

                            Strength =
                                cartItem.Strength,

                            UnitPrice =
                                cartItem.Price,

                            Quantity =
                                cartItem.Quantity,

                            LineTotal =
                                cartItem.Price *
                                cartItem.Quantity
                        };


                    _context.OrderItems.Add(
                        orderItem
                    );
                }



                // =============================================
                // CREATE PAYMENT DATABASE ROW
                // =============================================

                var payment =
                    new Payment
                    {
                        OrderId =
                            order.Id,

                        TransactionId =
                            transactionId,

                        Amount =
                            totalAmount,

                        Currency =
                            "BDT",

                        Status =
                            "Initiated",

                        CreatedAt =
                            DateTime.Now
                    };


                _context.Payments.Add(
                    payment
                );


                await _context.SaveChangesAsync();



                // =============================================
                // CONFIGURATION
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


                var ipnUrl =
                    _configuration[
                        "SslCommerz:IpnUrl"
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
                                "SSLCOMMERZ configuration is missing."
                        }
                    );
                }



                // =============================================
                // PRODUCT NAME
                // =============================================

                var productName =
                    string.Join(
                        ", ",
                        cart.Select(
                            item =>
                                item.MedicineName
                        )
                    );


                productName =
                    LimitLength(
                        productName,
                        250
                    );



                // =============================================
                // CUSTOMER VALUES
                // =============================================

                var customerName =
                    LimitLength(
                        patient.FullName,
                        50
                    );


                var customerEmail =
                    LimitLength(
                        patient.Email,
                        50
                    );


                var customerAddress =
                    LimitLength(
                        string.IsNullOrWhiteSpace(
                            patient.Address
                        )
                            ? "Dhaka"
                            : patient.Address,
                        50
                    );


                var customerPhone =
                    LimitLength(
                        string.IsNullOrWhiteSpace(
                            patient.Phone
                        )
                            ? "01700000000"
                            : patient.Phone,
                        20
                    );



                // =============================================
                // SSLCOMMERZ FORM
                // =============================================

                var formData =
                    new Dictionary<string, string>
                    {
                        ["store_id"] =
                            storeId,

                        ["store_passwd"] =
                            storePassword,

                        ["total_amount"] =
                            totalAmount.ToString(
                                "0.00",
                                CultureInfo.InvariantCulture
                            ),

                        ["currency"] =
                            "BDT",

                        ["tran_id"] =
                            transactionId,


                        // =====================================
                        // CALLBACKS
                        // =====================================

                        ["success_url"] =
                            $"{backendBaseUrl}/api/payment/success",

                        ["fail_url"] =
                            $"{backendBaseUrl}/api/payment/fail",

                        ["cancel_url"] =
                            $"{backendBaseUrl}/api/payment/cancel",


                        // =====================================
                        // CUSTOMER
                        // =====================================

                        ["cus_name"] =
                            customerName,

                        ["cus_email"] =
                            customerEmail,

                        ["cus_add1"] =
                            customerAddress,

                        ["cus_city"] =
                            "Dhaka",

                        ["cus_state"] =
                            "Dhaka",

                        ["cus_postcode"] =
                            "1000",

                        ["cus_country"] =
                            "Bangladesh",

                        ["cus_phone"] =
                            customerPhone,


                        // =====================================
                        // PRODUCT
                        // =====================================

                        ["product_name"] =
                            productName,

                        ["product_category"] =
                            "healthcare",

                        ["product_profile"] =
                            "physical-goods",

                        ["shipping_method"] =
                            "NO",

                        ["num_of_item"] =
                            cart.Sum(
                                item =>
                                    item.Quantity
                            )
                            .ToString(
                                CultureInfo.InvariantCulture
                            ),

                        ["emi_option"] =
                            "0",


                        // =====================================
                        // OUR OWN VALUES
                        // =====================================

                        ["value_a"] =
                            order.Id.ToString(),

                        ["value_b"] =
                            order.OrderNumber
                    };



                // =============================================
                // IPN
                //
                // localhost cannot receive server-to-server IPN.
                // Leave blank for local testing.
                // =============================================

                if (
                    !string.IsNullOrWhiteSpace(
                        ipnUrl
                    )
                )
                {
                    formData[
                        "ipn_url"
                    ] =
                        ipnUrl;
                }



                // =============================================
                // CREATE HTTP CLIENT
                // =============================================

                var client =
                    _httpClientFactory
                        .CreateClient();



                // =============================================
                // SEND PAYMENT SESSION REQUEST
                // =============================================

                var gatewayResponse =
                    await client.PostAsync(
                        sessionUrl,
                        new FormUrlEncodedContent(
                            formData
                        )
                    );



                var responseText =
                    await gatewayResponse
                        .Content
                        .ReadAsStringAsync();



                if (
                    !gatewayResponse
                        .IsSuccessStatusCode
                )
                {
                    payment.Status =
                        "Initiation Failed";


                    order.PaymentStatus =
                        "Failed";


                    order.OrderStatus =
                        "Payment Failed";


                    await _context
                        .SaveChangesAsync();


                    return StatusCode(
                        502,
                        new
                        {
                            message =
                                "Payment gateway could not create a session.",

                            detail =
                                responseText
                        }
                    );
                }



                // =============================================
                // PARSE RESPONSE
                // =============================================

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
                // FAILED SESSION
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
                    payment.Status =
                        "Initiation Failed";


                    order.PaymentStatus =
                        "Failed";


                    order.OrderStatus =
                        "Payment Failed";


                    await _context
                        .SaveChangesAsync();


                    return BadRequest(new
                    {
                        message =
                            string.IsNullOrWhiteSpace(
                                failedReason
                            )
                                ? "Could not create payment session."
                                : failedReason
                    });
                }



                // =============================================
                // SESSION SUCCESS
                // =============================================

                payment.SessionKey =
                    sessionKey;


                payment.Status =
                    "Pending";


                await _context
                    .SaveChangesAsync();



                // =============================================
                // RETURN URL TO REACT
                // =============================================

                return Ok(new
                {
                    message =
                        "Payment session created successfully.",

                    orderId =
                        order.Id,

                    orderNumber =
                        order.OrderNumber,

                    transactionId =
                        transactionId,

                    totalAmount =
                        totalAmount,

                    paymentUrl =
                        gatewayPageUrl
                });
            }

            catch (Exception ex)
            {
                Console.WriteLine(
                    "================================"
                );

                Console.WriteLine(
                    "PAYMENT INITIATION ERROR"
                );

                Console.WriteLine(
                    ex.InnerException?.Message
                    ??
                    ex.Message
                );

                Console.WriteLine(
                    "================================"
                );


                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Could not initiate payment.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // SUCCESS
        //
        // SSLCOMMERZ redirects browser here.
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
                    return Redirect(
                        $"{GetFrontendUrl()}/patient-account?payment=failed"
                    );
                }



                var successful =
                    await ProcessSuccessfulPayment(
                        transactionId,
                        validationId
                    );



                if (!successful)
                {
                    return Redirect(
                        $"{GetFrontendUrl()}/patient-account?payment=failed"
                    );
                }



                return Redirect(
                    $"{GetFrontendUrl()}/patient-account?payment=success"
                );
            }

            catch (Exception ex)
            {
                Console.WriteLine(
                    "PAYMENT SUCCESS CALLBACK ERROR:"
                );


                Console.WriteLine(
                    ex.InnerException?.Message
                    ??
                    ex.Message
                );


                return Redirect(
                    $"{GetFrontendUrl()}/patient-account?payment=failed"
                );
            }
        }



        // =====================================================
        // FAILURE
        // =====================================================

        [HttpPost("fail")]
        public async Task<IActionResult> Fail()
        {
            try
            {
                var form =
                    await Request
                        .ReadFormAsync();


                var transactionId =
                    form["tran_id"]
                        .ToString();


                await MarkPaymentFailed(
                    transactionId,
                    "Failed"
                );


                return Redirect(
                    $"{GetFrontendUrl()}/patient-account?payment=failed"
                );
            }

            catch
            {
                return Redirect(
                    $"{GetFrontendUrl()}/patient-account?payment=failed"
                );
            }
        }



        // =====================================================
        // CANCEL
        // =====================================================

        [HttpPost("cancel")]
        public async Task<IActionResult> Cancel()
        {
            try
            {
                var form =
                    await Request
                        .ReadFormAsync();


                var transactionId =
                    form["tran_id"]
                        .ToString();


                await MarkPaymentFailed(
                    transactionId,
                    "Cancelled"
                );


                return Redirect(
                    $"{GetFrontendUrl()}/patient-account?payment=cancelled"
                );
            }

            catch
            {
                return Redirect(
                    $"{GetFrontendUrl()}/patient-account?payment=cancelled"
                );
            }
        }



        // =====================================================
        // IPN
        //
        // This is useful after deployment when backend
        // has a public HTTPS URL.
        // =====================================================

        [HttpPost("ipn")]
        public async Task<IActionResult> Ipn()
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


                var status =
                    form["status"]
                        .ToString();



                if (
                    string.Equals(
                        status,
                        "VALID",
                        StringComparison.OrdinalIgnoreCase
                    )
                    ||
                    string.Equals(
                        status,
                        "VALIDATED",
                        StringComparison.OrdinalIgnoreCase
                    )
                )
                {
                    var successful =
                        await ProcessSuccessfulPayment(
                            transactionId,
                            validationId
                        );


                    if (successful)
                    {
                        return Ok(new
                        {
                            message =
                                "Payment IPN processed."
                        });
                    }
                }



                await MarkPaymentFailed(
                    transactionId,
                    status
                );


                return Ok(new
                {
                    message =
                        "Payment status received."
                });
            }

            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Could not process payment IPN.",

                        detail =
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // ORDER HISTORY
        //
        // GET:
        // /api/payment/orders/5
        //
        // Only successful orders are returned.
        // Each order contains exact medicines ordered.
        // =====================================================

        [HttpGet("orders/{patientId:int}")]
        public async Task<IActionResult> GetOrders(
            int patientId
        )
        {
            try
            {
                var patientExists =
                    await _context.Patients
                        .AnyAsync(
                            patient =>
                                patient.Id ==
                                patientId
                        );


                if (!patientExists)
                {
                    return NotFound(new
                    {
                        message =
                            "Patient not found."
                    });
                }



                var orders =
                    await _context.Orders

                        .Where(
                            order =>

                                order.PatientId ==
                                patientId

                                &&

                                order.PaymentStatus ==
                                "Paid"

                                &&

                                order.OrderStatus ==
                                "Confirmed"
                        )

                        .OrderByDescending(
                            order =>
                                order.PaidAt
                                ??
                                order.CreatedAt
                        )

                        .ToListAsync();



                var result =
                    new List<object>();



                foreach (
                    var order
                    in orders
                )
                {
                    var items =
                        await _context.OrderItems

                            .Where(
                                item =>
                                    item.OrderId ==
                                    order.Id
                            )

                            .OrderBy(
                                item =>
                                    item.Id
                            )

                            .Select(
                                item =>
                                    new
                                    {
                                        item.Id,

                                        item.MedicineId,

                                        item.MedicineName,

                                        item.GenericName,

                                        item.Strength,

                                        item.UnitPrice,

                                        item.Quantity,

                                        item.LineTotal
                                    }
                            )

                            .ToListAsync();



                    var totalItems =
                        items.Sum(
                            item =>
                                item.Quantity
                        );



                    result.Add(
                        new
                        {
                            order.Id,

                            order.OrderNumber,

                            order.TransactionId,

                            order.TotalAmount,

                            order.OrderStatus,

                            order.PaymentStatus,

                            order.CreatedAt,

                            order.PaidAt,

                            totalItems,

                            items
                        }
                    );
                }



                return Ok(
                    result
                );
            }

            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Could not load order history.",

                        detail =
                            ex.InnerException?.Message
                            ??
                            ex.Message
                    }
                );
            }
        }



        // =====================================================
        // VALIDATE + CONFIRM SUCCESSFUL PAYMENT
        // =====================================================

        private async Task<bool> ProcessSuccessfulPayment(
            string transactionId,
            string validationId
        )
        {
            var order =
                await _context.Orders
                    .FirstOrDefaultAsync(
                        order =>
                            order.TransactionId ==
                            transactionId
                    );


            if (order == null)
            {
                return false;
            }



            // Already processed.
            if (
                order.PaymentStatus ==
                "Paid"
            )
            {
                return true;
            }



            // =============================================
            // VALIDATE WITH SSLCOMMERZ
            // =============================================

            var validation =
                await ValidateTransaction(
                    validationId
                );


            if (validation == null)
            {
                return false;
            }



            // =============================================
            // STATUS
            // =============================================

            var successfulStatus =

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


            if (!successfulStatus)
            {
                return false;
            }



            // =============================================
            // VERIFY OUR TRANSACTION ID
            // =============================================

            if (
                !string.Equals(
                    validation.TransactionId,
                    order.TransactionId,
                    StringComparison.Ordinal
                )
            )
            {
                return false;
            }



            // =============================================
            // VERIFY AMOUNT
            // =============================================

            if (
                Math.Abs(
                    validation.Amount -
                    order.TotalAmount
                )
                >
                0.01m
            )
            {
                return false;
            }



            // =============================================
            // VERIFY CURRENCY
            // =============================================

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



            // =============================================
            // DATABASE TRANSACTION
            // =============================================

            await using var databaseTransaction =
                await _context.Database
                    .BeginTransactionAsync();


            try
            {
                var payment =
                    await _context.Payments
                        .FirstOrDefaultAsync(
                            currentPayment =>
                                currentPayment.OrderId ==
                                order.Id
                        );


                if (payment == null)
                {
                    await databaseTransaction
                        .RollbackAsync();


                    return false;
                }



                // =========================================
                // CONFIRM ORDER
                // =========================================

                order.PaymentStatus =
                    "Paid";


                order.OrderStatus =
                    "Confirmed";


                order.PaidAt =
                    DateTime.Now;



                // =========================================
                // PAYMENT
                // =========================================

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



                // =========================================
                // GET THE EXACT ORDERED MEDICINES
                // =========================================

                var orderItems =
                    await _context.OrderItems

                        .Where(
                            item =>
                                item.OrderId ==
                                order.Id
                        )

                        .ToListAsync();



                // =========================================
                // REMOVE ORDERED QUANTITY FROM CART
                //
                // DO NOT INCREASE OR DECREASE STOCK.
                //
                // Stock was already decreased when
                // medicine was added to cart.
                // =========================================

                foreach (
                    var orderItem
                    in orderItems
                )
                {
                    if (
                        orderItem.MedicineId ==
                        null
                    )
                    {
                        continue;
                    }



                    var cartItem =
                        await _context.CartItems
                            .FirstOrDefaultAsync(
                                currentCart =>

                                    currentCart.PatientId ==
                                    order.PatientId

                                    &&

                                    currentCart.MedicineId ==
                                    orderItem.MedicineId.Value
                            );


                    if (
                        cartItem ==
                        null
                    )
                    {
                        continue;
                    }



                    if (
                        cartItem.Quantity >
                        orderItem.Quantity
                    )
                    {
                        cartItem.Quantity -=
                            orderItem.Quantity;


                        cartItem.UpdatedAt =
                            DateTime.Now;
                    }

                    else
                    {
                        _context.CartItems.Remove(
                            cartItem
                        );
                    }
                }



                await _context
                    .SaveChangesAsync();



                await databaseTransaction
                    .CommitAsync();



                return true;
            }

            catch
            {
                await databaseTransaction
                    .RollbackAsync();


                throw;
            }
        }



        // =====================================================
        // SSLCOMMERZ VALIDATION API
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


            var returnedTransactionId =
                GetJsonString(
                    root,
                    "tran_id"
                );


            var amountText =
                GetJsonString(
                    root,
                    "amount"
                );


            var currency =
                GetJsonString(
                    root,
                    "currency"
                );


            var bankTransactionId =
                GetJsonString(
                    root,
                    "bank_tran_id"
                );


            var cardType =
                GetJsonString(
                    root,
                    "card_type"
                );



            if (
                !decimal.TryParse(
                    amountText,
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
                    status,

                TransactionId =
                    returnedTransactionId,

                Amount =
                    amount,

                Currency =
                    currency,

                BankTransactionId =
                    bankTransactionId,

                CardType =
                    cardType
            };
        }



        // =====================================================
        // MARK FAILURE / CANCELLATION
        // =====================================================

        private async Task MarkPaymentFailed(
            string transactionId,
            string status
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    transactionId
                )
            )
            {
                return;
            }



            var order =
                await _context.Orders
                    .FirstOrDefaultAsync(
                        currentOrder =>
                            currentOrder.TransactionId ==
                            transactionId
                    );


            if (order == null)
            {
                return;
            }



            // Never overwrite success.

            if (
                order.PaymentStatus ==
                "Paid"
            )
            {
                return;
            }



            var payment =
                await _context.Payments
                    .FirstOrDefaultAsync(
                        currentPayment =>
                            currentPayment.OrderId ==
                            order.Id
                    );



            if (
                string.Equals(
                    status,
                    "Cancelled",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                order.PaymentStatus =
                    "Cancelled";


                order.OrderStatus =
                    "Cancelled";


                if (payment != null)
                {
                    payment.Status =
                        "Cancelled";
                }
            }

            else
            {
                order.PaymentStatus =
                    "Failed";


                order.OrderStatus =
                    "Payment Failed";


                if (payment != null)
                {
                    payment.Status =
                        "Failed";
                }
            }



            await _context
                .SaveChangesAsync();
        }



        // =====================================================
        // FRONTEND URL
        // =====================================================

        private string GetFrontendUrl()
        {
            return
                _configuration[
                    "SslCommerz:FrontendBaseUrl"
                ]

                ??

                "http://localhost:5173";
        }



        // =====================================================
        // STRING LIMIT
        // =====================================================

        private static string LimitLength(
            string? value,
            int maximumLength
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    value
                )
            )
            {
                return "";
            }


            var text =
                value.Trim();


            if (
                text.Length <=
                maximumLength
            )
            {
                return text;
            }


            return text.Substring(
                0,
                maximumLength
            );
        }



        // =====================================================
        // JSON HELPER
        // =====================================================

        private static string GetJsonString(
            JsonElement element,
            string propertyName
        )
        {
            if (
                element.TryGetProperty(
                    propertyName,
                    out var property
                )
            )
            {
                return property.ToString();
            }


            return "";
        }



        // =====================================================
        // INTERNAL VALIDATION MODEL
        // =====================================================

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