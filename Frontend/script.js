const joinQueueBtn = document.getElementById("joinQueueBtn");

if (joinQueueBtn) {
    joinQueueBtn.addEventListener("click", () => {
        window.location.href = "token.html";
    });
}
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        window.location.href = "login.html";
    });
}
const trackQueueBtn = document.getElementById("trackQueueBtn");

if (trackQueueBtn) {
    trackQueueBtn.addEventListener("click", () => {
        window.location.href = "track.html";
    });
}

// ==========================================
// TOKEN FORM - GENERATE NEW TOKEN
// ==========================================

// Find the Get Token button on token.html
const getTokenBtn = document.getElementById("getTokenBtn");

// Run this code only when the token form exists
if (getTokenBtn) {

    getTokenBtn.addEventListener("click", async () => {

        // Get customer name from the input field
        const customerName =
            document.getElementById("customerName").value.trim();

        // Get selected service
        const service =
            document.getElementById("service").value;

      // Check if customer entered their name
        if (!customerName) {
            alert("Please enter your name");
            return;
        }

        // Check if customer selected a service
        if (!service) {
            alert("Please select a service");
            return;
        }

        try {

            // Send customer details to our Node.js backend
            const response = await fetch(
                "http://192.168.29.102:5000/api/queue",
                {
                    method: "POST",

                    // Tell the backend that we are sending JSON
                    headers: {
                        "Content-Type": "application/json"
                    },

                    // Send name and service
                    // Token number is NOT sent.
                    // Backend generates it automatically.
                    body: JSON.stringify({
    customerName: customerName,
    service: service
})
                }
            );

            // Convert backend response into JavaScript object
            const data = await response.json();

            // Check whether backend returned an error
            if (!response.ok) {
                throw new Error(data.message || "Token generation failed");
            }

            // Display the generated token
            document.getElementById("tokenResult").innerHTML = `
                <h2>Your Token Number</h2>
                <h1>${data.tokenNumber}</h1>
                <p>Name: ${data.customerName}</p>
                <p>Service: ${data.service}</p>
                <p>Status: ${data.status}</p>
            `;

        } catch (error) {

            // Show error in browser console
            console.error("Token generation error:", error);

            // Tell the customer something went wrong
            document.getElementById("tokenResult").innerHTML = `
                <p>Unable to generate token.</p>
                <p>Please try again.</p>
            `;
        }
    });
}
// ==========================================
// TRACK QUEUE
// ==========================================

const trackBtn = document.getElementById("trackBtn");

if (trackBtn) {

    trackBtn.addEventListener("click", async () => {

        const tokenNumber =
            document.getElementById("tokenNumber").value.trim();

        // Check token number
        if (!tokenNumber) {
            alert("Please enter your token number");
            return;
        }

        try {

            // Get all customers from backend
            const response = await fetch(
                "http://192.168.29.102:5000/api/queue"
            );

            const queue = await response.json();

            if (!response.ok) {
                throw new Error(
                    queue.message || "Unable to get queue"
                );
            }

            // Find customer's token
            const customer = queue.find(
                item => item.tokenNumber == tokenNumber
            );

            // Token not found
            if (!customer) {
                document.getElementById("queueResult").innerHTML = `
                    <p>Token not found.</p>
                `;
                return;
            }

            // Customers waiting before this token
            const peopleAhead = queue.filter(
                item =>
                    item.tokenNumber < customer.tokenNumber &&
                    item.status === "waiting"
            ).length;

            // Display result
            document.getElementById("queueResult").innerHTML = `
                <h2>Queue Status</h2>

                <h3>Token Number: ${customer.tokenNumber}</h3>

                <p>Name: ${customer.customerName}</p>

                <p>Service: ${customer.service}</p>

                <p>Status: ${customer.status}</p>
                <p>People Ahead: ${peopleAhead}</p>
                <p>Estimated Wait: ~${peopleAhead * 5} minutes</p>
                
            `;

        } catch (error) {

            console.error("Queue tracking error:", error);

            document.getElementById("queueResult").innerHTML = `
                <p>Unable to track queue.</p>
                <p>Please try again.</p>
            `;
        }
    });
}
// ==========================================
// ADMIN DASHBOARD
// ==========================================

const nextCustomerBtn = document.getElementById("nextCustomerBtn");
const adminQueue = document.getElementById("adminQueue");
const currentCustomer = document.getElementById("currentCustomer");
const queueStats = document.getElementById("queueStats");

// Load all customers
 async function loadAdminQueue() {

    try {

        const response = await fetch(
            "http://192.168.29.102:5000/api/queue"
        );

        const queue = await response.json();

        if (!response.ok) {
            throw new Error(
                queue.message || "Unable to load queue"
            );
        }

        // Clear old queue
        adminQueue.innerHTML = "";

        // Statistics
        const totalCustomers = queue.length;

        const waitingCustomers = queue.filter(
            customer => customer.status === "waiting"
        ).length;

        const servingCustomers = queue.filter(
            customer => customer.status === "serving"
        ).length;

        const completedCustomers = queue.filter(
            customer => customer.status === "completed"
        ).length;

        // Show statistics
        queueStats.innerHTML = `
            <div class="stats-container">

                <div class="stat-card">
                    <h3>Total</h3>
                    <p>${totalCustomers}</p>
                </div>

                <div class="stat-card">
                    <h3>Waiting</h3>
                    <p>${waitingCustomers}</p>
                </div>

                <div class="stat-card">
                    <h3>Serving</h3>
                    <p>${servingCustomers}</p>
                </div>

                <div class="stat-card">
                    <h3>Completed</h3>
                    <p>${completedCustomers}</p>
                </div>

            </div>
        `;

        // Show customers
        queue.forEach(customer => {

            const customerCard = document.createElement("div");

            customerCard.innerHTML = `
                <h3>Token: ${customer.tokenNumber}</h3>
                <p>Name: ${customer.customerName}</p>
                <p>Service: ${customer.service}</p>
                <p>Status: ${customer.status}</p>
            `;

            adminQueue.appendChild(customerCard);
        });

    } catch (error) {

        console.error("Admin queue error:", error);

        adminQueue.innerHTML = `
            <p>Unable to load queue.</p>
        `;
    }
}

// Next customer button
if (nextCustomerBtn) {

    nextCustomerBtn.addEventListener("click", async () => {
       
        try {

            const response = await fetch(
                "http://192.168.29.102:5000/api/queue/next",
                {
                    method: "PATCH"
                }
            );

            const customer = await response.json();

            if (!response.ok) {
                throw new Error(
                    customer.message || "No customer available"
                );
            }

            // Show current customer
            currentCustomer.innerHTML = `
                <h2>Currently Serving</h2>

                <h3>Token: ${customer.tokenNumber}</h3>

                <p>Name: ${customer.customerName}</p>

                <p>Service: ${customer.service}</p>

                <p>Status: ${customer.status}</p>

                <button onclick="completeCustomer('${customer._id}')">
                    Complete Customer
                </button>
            `;

            // Refresh queue
            loadAdminQueue();

        } catch (error) {

            console.error("Next customer error:", error);

            currentCustomer.innerHTML = `
                <p>${error.message}</p>
            `;
        }
    });
}


// Complete customer
async function completeCustomer(customerId) {

    try {

        const response = await fetch(
            `http://192.168.29.102:5000/api/queue/${customerId}/complete`,
            {
                method: "PATCH"
            }
        );

        const customer = await response.json();

        if (!response.ok) {
            throw new Error(
                customer.message || "Unable to complete customer"
            );
        }

        currentCustomer.innerHTML = `
            <p>Token ${customer.tokenNumber} completed successfully.</p>
        `;

        // Refresh queue
        loadAdminQueue();

    } catch (error) {

        console.error("Complete customer error:", error);

        currentCustomer.innerHTML = `
            <p>Unable to complete customer.</p>
        `;
    }
}


// Load queue when admin page opens
if (adminQueue) {
    loadAdminQueue();
}
// ==========================================
// ADMIN LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value;

        const loginMessage =
            document.getElementById("loginMessage");

        try {

            const response = await fetch(
                "http://192.168.29.102:5000/api/admin/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Login failed"
                );
            }

            loginMessage.textContent =
                "Login successful!";

            // Open admin dashboard
            window.location.href = "admin.html";

        } catch (error) {

            console.error("Login error:", error);

            loginMessage.textContent =
                error.message;

        }

    });
}
// ==========================================
// CONTACT FORM
// ==========================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("contactName").value.trim();

        const email =
            document.getElementById("contactEmail").value.trim();

        const message =
            document.getElementById("contactMessage").value.trim();

        const contactResult =
            document.getElementById("contactResult");

        try {

            const response = await fetch(
                "http://192.168.29.102:5000/api/contact",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        message: message
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to send message"
                );
            }

            contactResult.textContent =
                "Message sent successfully!";

            contactForm.reset();

        } catch (error) {

            console.error("Contact form error:", error);

            contactResult.textContent =
                "Unable to send message. Please try again.";
        }

    });
}

const testimonialForm =
    document.getElementById("testimonialForm");

if (testimonialForm) {

    testimonialForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("testimonialName")
                .value.trim();

        const rating =
            document.querySelector(
                'input[name="rating"]:checked'
            )?.value;

        const feedback =
            document.getElementById("testimonialFeedback")
                .value.trim();

        const photoInput =
            document.getElementById("testimonialPhoto");

        const testimonialResult =
            document.getElementById("testimonialResult");

        // Check rating
        if (!rating) {

            testimonialResult.textContent =
                "Please select a rating.";

            return;
        }

        // Create FormData
        const formData = new FormData();

        formData.append("name", name);
        formData.append("rating", rating);
        formData.append("feedback", feedback);

        // Photo is optional
        if (photoInput.files.length > 0) {

            formData.append(
                "photo",
                photoInput.files[0]
            );
        }

        try {

            const response = await fetch(
                "http://192.168.29.102:5000/api/testimonials",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to submit testimonial"
                );
            }

            testimonialResult.textContent =
                "Thank you! Your testimonial has been submitted for approval.";

            testimonialForm.reset();

        } catch (error) {

            console.error(
                "Testimonial submission error:",
                error
            );

            testimonialResult.textContent =
                "Unable to submit testimonial. Please try again.";
        }

    });
}
// ==========================================
// ADMIN TESTIMONIALS
// ==========================================

const pendingTestimonials =
    document.getElementById("pendingTestimonials");

async function loadPendingTestimonials() {

    if (!pendingTestimonials) {
        return;
    }

    try {

        const response = await fetch(
            "http://192.168.29.102:5000/api/testimonials/pending"
        );

        const testimonials = await response.json();

        if (!response.ok) {
            throw new Error(
                testimonials.message ||
                "Unable to load testimonials"
            );
        }

        pendingTestimonials.innerHTML = "";

        if (testimonials.length === 0) {

            pendingTestimonials.innerHTML =
                "<p>No pending testimonials.</p>";

            return;
        }

        testimonials.forEach(testimonial => {

            const card =
                document.createElement("div");

            card.className =
                "admin-testimonial-card";

                const initial =
    testimonial.name.charAt(0).toUpperCase();

const avatarContent = testimonial.photo
    ? `<img src="http://192.168.29.102:5000${testimonial.photo}"
            alt="${testimonial.name}"
            class="testimonial-photo">`
    : initial;

            card.innerHTML = `
                <h3>${testimonial.name}</h3>

                <p>
                    Rating:
                    ${"⭐".repeat(testimonial.rating)}
                </p>

                <p>
                    ${testimonial.feedback}
                </p>

                <button
                    onclick="approveTestimonial('${testimonial._id}')">
                    Approve
                </button>

                <button
                    onclick="deleteTestimonial('${testimonial._id}')">
                    Delete
                </button>
            `;

            pendingTestimonials.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Pending testimonials error:",
            error
        );

        pendingTestimonials.innerHTML =
            "<p>Unable to load testimonials.</p>";
    }
}


// Approve testimonial

async function approveTestimonial(id) {

    try {

        const response = await fetch(
            `http://192.168.29.102:5000/api/testimonials/${id}/approve`,
            {
                method: "PATCH"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to approve testimonial"
            );
        }

        loadPendingTestimonials();

    } catch (error) {

        console.error(
            "Approve testimonial error:",
            error
        );

        alert("Unable to approve testimonial.");
    }
}


// Delete testimonial

async function deleteTestimonial(id) {
// ==========================================
// UNAPPROVE TESTIMONIAL
// ==========================================

async function unapproveTestimonial(id) {

    try {

        const response = await fetch(
            `http://192.168.29.102:5000/api/testimonials/${id}/unapprove`,
            {
                method: "PATCH"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to unapprove testimonial"
            );
        }

        // Refresh approved testimonials
        loadApprovedTestimonialsAdmin();

    } catch (error) {

        console.error(
            "Unapprove testimonial error:",
            error
        );

        alert("Unable to unapprove testimonial.");
    }
}
    try {

        const response = await fetch(
            `http://192.168.29.102:5000/api/testimonials/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to delete testimonial"
            );
        }

        loadPendingTestimonials();

    } catch (error) {

        console.error(
            "Delete testimonial error:",
            error
        );

        alert("Unable to delete testimonial.");
    }
}


// Load testimonials when admin page opens

if (pendingTestimonials) {
    loadPendingTestimonials();
}
// ==========================================
// APPROVED TESTIMONIALS - HOME PAGE
// ==========================================

const approvedTestimonials =
    document.getElementById("approvedTestimonials");

async function loadApprovedTestimonials() {

    if (!approvedTestimonials) {
        return;
    }

    try {

        const response = await fetch(
            "http://192.168.29.102:5000/api/testimonials/approved"
        );

        const testimonials = await response.json();

        if (!response.ok) {
            throw new Error(
                testimonials.message ||
                "Unable to load testimonials"
            );
        }
        // ==========================================
// TESTIMONIAL AUTO SLIDER
// ==========================================

function startTestimonialSlider() {

    const cards =
        document.querySelectorAll(
            "#approvedTestimonials .testimonial-card"
        );

    if (cards.length <= 1) {
        return;
    }

    let currentIndex = 0;

    cards.forEach((card, index) => {

        if (index === 0) {
            card.classList.add("slider-visible");
        } else {
            card.classList.add("slider-hidden");
        }

    });

    setInterval(() => {

        cards[currentIndex]
            .classList.remove("slider-visible");

        cards[currentIndex]
            .classList.add("slider-hidden");

        currentIndex =
            (currentIndex + 1) % cards.length;

        cards[currentIndex]
            .classList.remove("slider-hidden");

        cards[currentIndex]
            .classList.add("slider-visible");

    }, 3000);
}

        approvedTestimonials.innerHTML = "";

        if (testimonials.length === 0) {

            approvedTestimonials.innerHTML =
                "<p>No testimonials yet.</p>";

            return;
        }

testimonials.forEach(testimonial => {

    const card =
        document.createElement("div");

    card.className =
        "testimonial-card";

    const initial =
        testimonial.name
            .charAt(0)
            .toUpperCase();

    const avatarContent = testimonial.photo
        ? `<img src="http://192.168.29.102:5000${testimonial.photo}"
                alt="${testimonial.name}"
                class="testimonial-photo">`
        : initial;

    card.innerHTML = `
        <div class="testimonial-avatar">
            ${avatarContent}
        </div>

        <h3>${testimonial.name}</h3>

        <div class="testimonial-stars">
            ${"⭐".repeat(testimonial.rating)}
        </div>

        <p class="testimonial-feedback">
            "${testimonial.feedback}"
        </p>
    `;

    approvedTestimonials.appendChild(card);

});
startTestimonialSlider();

    } catch (error) {

        console.error(
            "Approved testimonials error:",
            error
        );

        approvedTestimonials.innerHTML =
            "<p>Unable to load testimonials.</p>";
    }
}

if (approvedTestimonials) {
    loadApprovedTestimonials();
}
// ==========================================
// ADMIN - APPROVED TESTIMONIALS
// ==========================================

const approvedTestimonialsAdmin =
    document.getElementById("approvedTestimonialsAdmin");

async function loadApprovedTestimonialsAdmin() {

    if (!approvedTestimonialsAdmin) {
        return;
    }

    try {

        const response = await fetch(
            "http://192.168.29.102:5000/api/testimonials/approved"
        );

        const testimonials = await response.json();

        if (!response.ok) {
            throw new Error(
                testimonials.message ||
                "Unable to load approved testimonials"
            );
        }

        approvedTestimonialsAdmin.innerHTML = "";

        if (testimonials.length === 0) {

            approvedTestimonialsAdmin.innerHTML =
                "<p>No approved testimonials.</p>";

            return;
        }

        testimonials.forEach(testimonial => {

            const card =
                document.createElement("div");

            card.className =
                "admin-testimonial-card";

            card.innerHTML = `
                <h3>${testimonial.name}</h3>

                <p>
                    Rating:
                    ${"⭐".repeat(testimonial.rating)}
                </p>

                <p>
                    ${testimonial.feedback}
                </p>

                <button
                    onclick="unapproveTestimonial('${testimonial._id}')">
                    Unapprove
                </button>

                <button
                    onclick="deleteTestimonial('${testimonial._id}')">
                    Delete
                </button>
            `;

            approvedTestimonialsAdmin.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Approved testimonials error:",
            error
        );

        approvedTestimonialsAdmin.innerHTML =
            "<p>Unable to load approved testimonials.</p>";
    }
}

if (approvedTestimonialsAdmin) {
    loadApprovedTestimonialsAdmin();
}

// ==========================================
// SMART AI CHATBOT
// ==========================================

const sendChat = document.getElementById("sendChat");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const chatbotBtn = document.getElementById("chatbotBtn");
const chatbotBox = document.getElementById("chatbotBox");
const closeChatbot = document.getElementById("closeChatbot");
// Open chatbot
if (chatbotBtn && chatbotBox) {
    chatbotBtn.addEventListener("click", function () {
        chatbotBox.style.display = "block";
    });
}

// Close chatbot
if (closeChatbot && chatbotBox) {
    closeChatbot.addEventListener("click", function () {
        chatbotBox.style.display = "none";
    });
}

if (sendChat && chatInput && chatMessages) {

    let waitingForToken = false;

    sendChat.addEventListener("click", sendMessage);

    chatInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            sendMessage();
        }

    });


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    function sendMessage() {

        const message = chatInput.value.trim();

        if (!message) {
            return;
        }


        // If bot is waiting for token number
        if (waitingForToken) {

            waitingForToken = false;

            showUserMessage(message);

            chatInput.value = "";

            trackToken(message);

            return;
        }


        // Show user message
        showUserMessage(message);

        chatInput.value = "";


        // Bot response
        setTimeout(function () {

            const response = getBotResponse(message);

            showBotMessage(response);

        }, 500);
    }


    // ==========================================
    // SHOW USER MESSAGE
    // ==========================================

    function showUserMessage(message) {

        const userMessage =
            document.createElement("div");

        userMessage.className = "user-message";

        userMessage.textContent = message;

        chatMessages.appendChild(userMessage);

        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }


    // ==========================================
    // SHOW BOT MESSAGE
    // ==========================================

    function showBotMessage(message) {

        const botMessage =
            document.createElement("div");

        botMessage.className = "bot-message";

        botMessage.textContent = message;

        chatMessages.appendChild(botMessage);

        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }


    // ==========================================
    // BOT RESPONSE
    // ==========================================

    function getBotResponse(message) {

        const text = message.toLowerCase();


        // GREETING

        const greetings = [
            "hello",
            "hi",
            "hey",
            "hii",
            "good morning",
            "good evening"
        ];

        if (
            greetings.some(word =>
                text.includes(word)
            )
        ) {

            return "Hello! 👋 How can I help you with the queue system?";
        }


        // WORD GROUPS

        const queueWords = [
            "queue",
            "line",
            "waiting",
            "join"
        ];

        const tokenWords = [
            "token",
            "number",
            "ticket"
        ];

        const trackWords = [
            "track",
            "tracking",
            "status",
            "position",
            "where",
            "turn",
            "check",
            "place",
            "ahead"
        ];


        const hasQueueWord =
            queueWords.some(word =>
                text.includes(word)
            );

        const hasTokenWord =
            tokenWords.some(word =>
                text.includes(word)
            );

        const hasTrackWord =
            trackWords.some(word =>
                text.includes(word)
            );


        // ==========================================
        // TRACK TOKEN
        // ==========================================

        if (
            hasTrackWord &&
            (hasTokenWord || hasQueueWord)
        ) {

            waitingForToken = true;

            return "Sure! 😊 Please enter your token number.";
        }


        // ==========================================
        // JOIN QUEUE / GENERATE TOKEN
        // ==========================================

        if (
            (hasQueueWord || hasTokenWord) &&
            (
                text.includes("join") ||
                text.includes("get") ||
                text.includes("generate") ||
                text.includes("need")
            )
        ) {

            return "You can join the queue by clicking the 'Join Queue' button and generate your token. 🎫";
        }


        // ==========================================
        // SERVICES
        // ==========================================

        const serviceWords = [
            "service",
            "services",
            "available",
            "offer",
            "provide"
        ];

        if (
            serviceWords.some(word =>
                text.includes(word)
            )
        ) {

            return "Our system helps manage queues, generate tokens, track queue status and reduce waiting time. 😊";
        }


        // ==========================================
        // CONTACT / SUPPORT
        // ==========================================

        const supportWords = [
            "contact",
            "support",
            "problem",
            "issue"
        ];

        if (
            supportWords.some(word =>
                text.includes(word)
            )
        ) {

            return "You can contact our support team through the Contact page. 📩";
        }


        // ==========================================
        // HOW SYSTEM WORKS
        // ==========================================

        if (
            text.includes("how") &&
            (
                text.includes("work") ||
                text.includes("system")
            )
        ) {

            return "Our system generates a token for you and lets you track your position in the queue, helping reduce unnecessary waiting. 🤖";
        }


        // ==========================================
        // FALLBACK
        // ==========================================

        return "I'm here to help with queues, tokens, tracking, services and support. 🤖";
    }


    // ==========================================
    // TRACK TOKEN FROM BACKEND
    // ==========================================

    async function trackToken(tokenNumber) {

        showBotMessage("Checking your token... ⏳");

        try {

            const response =
                await fetch("http://192.168.29.102:5000/api/queue");

            const queue =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    "Unable to fetch queue"
                );
            }


            // Find token
            const customer =
                queue.find(item =>
                    String(item.tokenNumber).toLowerCase() ===
                    String(tokenNumber).toLowerCase()
                );


            // Token not found
            if (!customer) {

                showBotMessage(
                    "Sorry 😕 I couldn't find that token. Please check your token number and try again."
                );

                return;
            }


            // Count people ahead
            const customerIndex =
                queue.findIndex(item =>
                    String(item.tokenNumber).toLowerCase() ===
                    String(tokenNumber).toLowerCase()
                );


            const peopleAhead =
                queue
                    .slice(0, customerIndex)
                    .filter(item =>
                        item.status === "waiting"
                    ).length;


            showBotMessage(
                `🎫 Token: ${customer.tokenNumber}

📌 Status: ${customer.status}

👥 People Ahead: ${peopleAhead}

⏱️ Estimated Wait: ~${peopleAhead * 5} minutes`
            );

        } catch (error) {

            console.error(
                "Token tracking error:",
                error
            );

            showBotMessage(
                "Sorry 😕 I'm unable to check your token right now."
            );
        }
    }

}