# 💬 TalkBox — Real-Time Team Communication Platform

<div align="center">

### Where teams talk, work, and think together.

A modern, responsive, and interactive team communication platform built for **Vertex Labs**.

<br>

![HTML](https://img.shields.io/badge/HTML5-Frontend-orange?style=for-the-badge&logo=html5)
![CSS](https://img.shields.io/badge/CSS3-Styling-blue?style=for-the-badge&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![LocalStorage](https://img.shields.io/badge/LocalStorage-Persistence-green?style=for-the-badge)
![Responsive](https://img.shields.io/badge/Responsive-Design-purple?style=for-the-badge)

<br>

**Team Messaging • TalkBox Assistant • File Sharing • Search • Reactions • Notifications • Persistent Chats**

</div>

---

## 📌 About The Project

**TalkBox** is a modern internal communication and collaboration platform designed for the fictional technology company **Vertex Labs**.

The project goes beyond a basic chat interface by combining team conversations, an intelligent built-in assistant, employee profiles, message reactions, file sharing, notifications, saved messages, pinned conversations, search, and persistent chat history in one responsive workspace.

TalkBox was designed to provide an experience similar to modern workplace communication applications while remaining lightweight and easy to run.

---

## ✨ Main Features

<table>
<tr>
<td width="50%">

### 💬 Team Messaging

- Real-time style messaging interface
- Individual employee conversations
- Persistent conversation history
- Sent and received message styling
- Message timestamps
- Smooth automatic scrolling
- Context-based employee responses

</td>

<td width="50%">

### 🤖 TalkBox Assistant

- Built-in AI-style assistant
- 100 predefined questions and answers
- Multiple knowledge categories
- Flexible question matching
- Programming assistance
- General knowledge support
- No paid API key required

</td>
</tr>

<tr>
<td width="50%">

### 👥 Vertex Labs Directory

- Fixed fictional company employees
- Employee roles and departments
- Online status indicators
- Search by employee name
- Search by role
- Search by department
- Employee-specific conversations

</td>

<td width="50%">

### 📎 File & Media Sharing

- File attachments
- Image attachments
- Attachment previews
- File information
- Shared media
- Download support
- File type handling

</td>
</tr>

<tr>
<td width="50%">

### ⚡ Message Actions

- Reply to messages
- Copy messages
- Emoji reactions
- Pin important messages
- Save messages
- Delete own messages
- Message action controls

</td>

<td width="50%">

### 🔔 Workspace Features

- Notification system
- Unread message indicators
- Pinned conversations
- Saved messages
- Global search
- Conversation search
- Export option

</td>
</tr>
</table>

---

# 🤖 TalkBox Assistant

TalkBox contains its own built-in assistant for demonstration and educational purposes.

The assistant includes a **100-question knowledge pack** covering multiple domains.

Unlike an external AI API, this implementation does not require users to purchase or configure an API key.

### 📚 Knowledge Categories

| Category | Topics |
|---|---|
| 💻 Programming | Java, Python, JavaScript, C++, functions, variables, algorithms, recursion, OOP |
| 🌐 Web Development | HTML, CSS, React, Vue, Node.js, APIs, DOM, responsive design |
| 🤖 AI & Data | Artificial Intelligence, Machine Learning, Deep Learning, LLMs, Data Science |
| 🔬 Science | Photosynthesis, gravity, atoms, DNA, electricity, quantum computing |
| ➗ Mathematics | Multiplication, algebra, calculus, probability, percentages, Pi |
| 🌍 History & Geography | World Wars, countries, continents, democracy, United Nations |
| 💼 Career & Business | Careers, startups, entrepreneurship, SEO, marketing, interviews |
| ✍️ Writing & Study | Emails, essays, studying, exams, presentations, English |
| 🔐 Computing & Security | Cybersecurity, phishing, malware, Git, GitHub, databases |
| 🧠 General Knowledge | Internet, computers, teamwork, leadership, innovation |

---

## 💡 Example Questions

Try asking TalkBox Assistant:

```text
What is Java?
```

```text
Explain quantum computing.
```

```text
What is machine learning?
```

```text
What is SEO?
```

```text
How can I become a frontend developer?
```

```text
What is cybersecurity?
```

```text
How can I prepare for an interview?
```

```text
Explain recursion.
```

The assistant recognizes supported questions and returns an appropriate response from its built-in knowledge system.

> **Note:** TalkBox Assistant currently uses a predefined knowledge system rather than a live Large Language Model API. This allows the project to operate without paid API credentials.

---

# 👥 Vertex Labs Team

TalkBox includes a predefined fictional employee directory.

| Employee | Position | Department |
|---|---|---|
| 👨‍💻 Alex Morgan | Engineering Lead | Engineering |
| 👨‍💻 Ethan Brooks | Senior Frontend Engineer | Engineering |
| 👨‍💻 Noah Williams | Backend Engineer | Engineering |
| 👩‍💻 Priya Raman | Software Engineer | Engineering |
| ⚙️ Ahmed Khan | DevOps Engineer | Engineering |
| 🎨 Sarah Wilson | Product Designer | Product & Design |
| 📋 Mia Thompson | Product Manager | Product |
| 🔎 Chloe Dubois | UX Researcher | Product & Design |
| 📊 Daniel Carter | Data Analyst | Data |
| 🧠 Sofia Rossi | Data Scientist | Data |
| 📢 Olivia Smith | Marketing Manager | Marketing |
| ✍️ Emma Brown | Content Strategist | Marketing |
| 🧪 Emma Davis | QA Engineer | Quality Assurance |
| 🤝 James Anderson | Customer Success Manager | Customer Success |

> All employee identities used in TalkBox are fictional and created only for demonstration purposes.

---

# 🧠 Contextual Employee Conversations

Employees respond according to their professional roles.

For example:

### 🎨 Product Designer

Ask **Sarah Wilson**:

```text
The mobile layout has too much spacing.
```

The conversation focuses on UI/UX, spacing, responsive design, and usability.

### ⚙️ DevOps Engineer

Ask **Ahmed Khan**:

```text
The deployment failed after my latest commit.
```

The discussion focuses on deployment, infrastructure, CI/CD, logs, and debugging.

### 🧪 QA Engineer

Ask **Emma Davis**:

```text
The login button isn't working on mobile.
```

The response focuses on reproducing the bug, device/browser information, regression testing, and QA.

### 📢 Marketing Manager

Ask **Olivia Smith**:

```text
Can you suggest a marketing strategy for our new product launch?
```

The conversation focuses on launch strategy, messaging, campaigns, and marketing performance.

---

# 🔍 Search

TalkBox provides search functionality for quickly finding workspace information.

Users can search through:

- 👥 Employees
- 💬 Conversations
- 📝 Messages
- 📁 Shared files
- 🤖 Assistant conversations

Employee search supports:

```text
Sarah
```

```text
Engineer
```

```text
Design
```

If no predefined Vertex Labs employee matches the query, TalkBox displays an appropriate no-result state instead of creating a random employee.

---

# 😀 Message Reactions

Messages support emoji reactions.

Users can:

- Add reactions
- Remove reactions
- View reaction counts
- React to individual messages

Reaction state is stored so the interaction remains consistent during use.

---

# 📌 Pinned Messages

Important messages can be pinned for quick access.

Users can:

- Pin messages
- View pinned content
- Return to the original conversation
- Remove pinned messages

---

# 🔖 Saved Messages

TalkBox allows important messages to be saved.

Saved messages can later be accessed from the workspace without searching through the complete conversation history.

---

# 🔔 Notifications

The workspace contains notification functionality for events such as:

- New messages
- Reactions
- Shared files
- Workspace activity

Unread indicators help users identify conversations requiring attention.

---

# 💾 Persistent Conversations

TalkBox uses browser storage to preserve application state where appropriate.

This includes information such as:

- Messages
- Conversations
- Selected conversation
- Reactions
- Pinned messages
- Saved messages
- Theme preferences
- Notification state
- Unread indicators

This means refreshing the page does not immediately reset the entire workspace.

---

# 🌓 Theme Support

TalkBox provides a polished workspace appearance with theme support.

The interface is designed with:

- Professional typography
- Clean spacing
- Modern message bubbles
- Subtle shadows
- Status indicators
- Smooth transitions
- Accessible controls

---

# 📱 Responsive Design

TalkBox is designed to work across different screen sizes.

### 🖥 Desktop

Full workspace experience with conversation navigation and chat content.

### 📱 Mobile

Compact navigation and optimized messaging interface.

### 💻 Tablet

Adaptive layout between mobile and desktop experiences.

The responsive interface is designed to avoid horizontal overflow while keeping the message composer accessible.

---

# 🛠️ Technology Stack

<div align="center">

| Technology | Purpose |
|---|---|
| **HTML5** | Application structure |
| **CSS3** | UI styling and responsive design |
| **JavaScript** | Application logic and interactions |
| **LocalStorage** | Browser-side persistence |
| **DOM API** | Dynamic message rendering |
| **File API** | File and image handling |

</div>

---


## 2️⃣ Run TalkBox

Because the project is primarily frontend-based, it can be served using a simple local development server.

### Using VS Code Live Server

1. Open the project in **Visual Studio Code**
2. Install the **Live Server** extension
3. Open `index.html`
4. Click **Go Live**

The application will open in your browser.

You can also use another static HTTP server if preferred.

---

# 🎮 How To Use

1. Launch TalkBox.
2. Select a Vertex Labs employee from the conversation list.
3. Type a message in the composer.
4. Press **Enter** or click the Send button.
5. Use message actions to react, save, pin, copy, or reply.
6. Open **TalkBox Assistant** for supported knowledge questions.
7. Use **People** to browse/search employees.
8. Attach files or images where supported.
9. Use workspace search to locate conversations and content.

---

# 🎯 Project Objectives

The project demonstrates practical frontend development concepts including:

- DOM manipulation
- Event handling
- Responsive layouts
- State management
- Browser persistence
- Search algorithms
- Chat interface design
- File handling
- Dynamic rendering
- Interactive UI components
- Context-based response logic

---

# 🔐 Security & Privacy

TalkBox does not require a production API secret for its built-in 100-question assistant.

The project should never contain real passwords, API credentials, access tokens, or other private secrets when uploaded to a public GitHub repository.

Always review files before committing them to a public repository.

---

# ⚠️ Current Limitations

TalkBox is a frontend demonstration project and does not provide a real multi-user communication backend.

Current limitations include:

- Employees are fictional.
- Employee responses are simulated.
- TalkBox Assistant uses a predefined knowledge pack.
- The assistant is not equivalent to ChatGPT or another general-purpose LLM.
- The predefined assistant cannot reliably answer arbitrary questions outside its supported knowledge.
- Browser storage is device/browser-specific.
- Messages are not synchronized between different real users.
- Some uploaded files may only remain available within the browser environment.

These limitations are intentionally documented to accurately represent the current implementation.

---

# 🔮 Future Improvements

Possible future versions could include:

- Real authentication
- WebSocket-based messaging
- Cloud database integration
- Real multi-user accounts
- Live LLM integration
- Voice messages
- Video/audio calls
- Team channels
- Group conversations
- Cloud file storage
- Advanced message search
- Push notifications

---

# 🧪 Testing

The application can be tested by checking:

- Sending messages
- Employee conversations
- TalkBox Assistant questions
- Search
- People directory
- Reactions
- Saved messages
- Pinned messages
- Attachments
- Notifications
- Theme behavior
- Browser refresh persistence
- Responsive layouts

---

# 🎓 Project Purpose

TalkBox was developed as a frontend development project demonstrating how modern communication-platform concepts can be implemented using web technologies.

It combines traditional messaging functionality with an AI-style knowledge assistant and productivity features to create a richer experience than a basic chat application.

---

# 👩‍💻 Developer

<div align="center">

### Developed with ❤️ as a Web Development Project

**TalkBox — Vertex Labs Communication Platform**

*Where teams talk, work, and think together.*

</div>

---

## ⭐ Support

If you like this project, consider giving the repository a **⭐ Star** on GitHub.

Contributions, suggestions, and improvements are welcome.

---

<div align="center">

### 💬 TalkBox

**Connect • Collaborate • Communicate**

Made with HTML, CSS & JavaScript

</div>
