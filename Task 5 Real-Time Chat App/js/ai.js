/* TalkBox — built-in 100-question knowledge pack.
 * This preserves the existing TalkBox interface while providing useful answers
 * without an API key. Questions are matched locally; no network request occurs.
 */
window.TBAI = (function () {
  "use strict";

  const KNOWLEDGE = [
  {
    "domain": "Programming",
    "question": "What is Java?",
    "answer": "Java is a high-level, class-based programming language designed to be portable across platforms through the Java Virtual Machine (JVM). It is widely used for backend systems, Android-related development, enterprise software, and large applications.",
    "aliases": [
      "Explain Java",
      "Tell me about Java"
    ]
  },
  {
    "domain": "Programming",
    "question": "Is Java object oriented?",
    "answer": "Yes. Java is primarily object-oriented: programs are commonly organized around classes and objects, with concepts such as encapsulation, inheritance, polymorphism, and abstraction. Java also includes primitive types and supports functional-style features such as lambdas.",
    "aliases": [
      "Is Java OOP",
      "Is Java an object oriented language"
    ]
  },
  {
    "domain": "Programming",
    "question": "What is Python?",
    "answer": "Python is a high-level, interpreted programming language known for readable syntax and a large ecosystem. It is commonly used for automation, web development, data science, AI, scripting, testing, and education.",
    "aliases": [
      "Explain Python"
    ]
  },
  {
    "domain": "Programming",
    "question": "What is a variable in programming?",
    "answer": "A variable is a named place used to store or reference a value so a program can use or change it later. For example, in Python `age = 20` stores the number 20 under the name `age`.",
    "aliases": [
      "Define variable in programming"
    ]
  },
  {
    "domain": "Programming",
    "question": "What is a function?",
    "answer": "A function is a reusable block of code that performs a specific task. It can accept inputs called parameters, execute logic, and optionally return a result. Functions reduce repetition and make programs easier to organize and test.",
    "aliases": [
      "Explain functions in programming"
    ]
  },
  {
    "domain": "Programming",
    "question": "What is recursion?",
    "answer": "Recursion is a technique where a function solves a problem by calling itself with a smaller version of that problem. A correct recursive function needs a base case that stops further calls.",
    "aliases": [
      "Explain recursion"
    ]
  },
  {
    "domain": "Programming",
    "question": "What is an array?",
    "answer": "An array is a data structure that stores an ordered collection of values, usually accessed by an index. In many languages arrays contain elements of the same type and provide fast indexed access.",
    "aliases": [
      "Explain arrays"
    ]
  },
  {
    "domain": "Programming",
    "question": "What is an algorithm?",
    "answer": "An algorithm is a finite, step-by-step procedure for solving a problem or completing a task. Good algorithms are judged by correctness, clarity, and efficiency in time and memory.",
    "aliases": [
      "Define algorithm"
    ]
  },
  {
    "domain": "Programming",
    "question": "What is object oriented programming?",
    "answer": "Object-oriented programming (OOP) organizes software around objects that combine data and behavior. Its core ideas include encapsulation, inheritance, polymorphism, and abstraction.",
    "aliases": [
      "Explain OOP",
      "What is OOP"
    ]
  },
  {
    "domain": "Programming",
    "question": "What is the difference between compiler and interpreter?",
    "answer": "A compiler generally translates a whole program into another form before execution, while an interpreter executes or translates code as the program runs. Many modern runtimes combine both approaches, such as bytecode plus just-in-time compilation.",
    "aliases": [
      "Compiler vs interpreter"
    ]
  },
  {
    "domain": "Web Development",
    "question": "What is HTML?",
    "answer": "HTML (HyperText Markup Language) defines the structure and meaning of content on a web page using elements such as headings, paragraphs, links, images, forms, and sections.",
    "aliases": [
      "Explain HTML"
    ]
  },
  {
    "domain": "Web Development",
    "question": "What is CSS?",
    "answer": "CSS (Cascading Style Sheets) controls the presentation of web pages, including layout, colors, typography, spacing, animations, and responsive behavior.",
    "aliases": [
      "Explain CSS"
    ]
  },
  {
    "domain": "Web Development",
    "question": "What is JavaScript?",
    "answer": "JavaScript is the main programming language of the web. It runs in browsers to add interactivity and can also run on servers through environments such as Node.js.",
    "aliases": [
      "Explain JavaScript"
    ]
  },
  {
    "domain": "Web Development",
    "question": "What is React?",
    "answer": "React is a JavaScript library for building user interfaces from reusable components. It uses declarative rendering and state-driven updates to keep interfaces synchronized with application data.",
    "aliases": [
      "Explain React"
    ]
  },
  {
    "domain": "Web Development",
    "question": "What is Vue?",
    "answer": "Vue is a progressive JavaScript framework for building web interfaces. It combines component-based development, reactive state, templates, and an approachable learning curve.",
    "aliases": [
      "Explain Vue"
    ]
  },
  {
    "domain": "Web Development",
    "question": "Compare React and Vue.",
    "answer": "React is a UI library with a large ecosystem and flexible architectural choices; Vue is a more integrated progressive framework with template syntax and a gentle learning curve. Both support components, reactivity, routing through ecosystem tools, and production-grade applications.",
    "aliases": [
      "React vs Vue",
      "Difference between React and Vue"
    ]
  },
  {
    "domain": "Web Development",
    "question": "Why does CSS z-index sometimes not work?",
    "answer": "`z-index` can appear not to work because stacking order is controlled by stacking contexts. Properties such as `position` with z-index, `transform`, `opacity`, `filter`, and certain layout rules can create new stacking contexts, so a child cannot escape its parent context simply by using a huge z-index.",
    "aliases": [
      "Why is z-index not working",
      "Why z index fails"
    ]
  },
  {
    "domain": "Web Development",
    "question": "What is responsive web design?",
    "answer": "Responsive web design makes a site adapt to different screen sizes and input modes. It typically uses flexible layouts, relative units, responsive images, and CSS media/container queries.",
    "aliases": [
      "Explain responsive design"
    ]
  },
  {
    "domain": "Web Development",
    "question": "What is an API?",
    "answer": "An API (Application Programming Interface) is a defined way for software systems to communicate. Web APIs commonly expose endpoints that accept requests and return structured data such as JSON.",
    "aliases": [
      "Explain API",
      "What does API mean"
    ]
  },
  {
    "domain": "Web Development",
    "question": "What is REST API?",
    "answer": "A REST API is a web API designed around resources and standard HTTP semantics such as GET, POST, PUT/PATCH, and DELETE. Good REST designs use predictable URLs, stateless requests, and meaningful HTTP status codes.",
    "aliases": [
      "Explain REST API"
    ]
  },
  {
    "domain": "AI & Data",
    "question": "What is artificial intelligence?",
    "answer": "Artificial intelligence (AI) is the field of building computer systems that perform tasks associated with human intelligence, such as understanding language, recognizing patterns, planning, prediction, and decision support.",
    "aliases": [
      "Explain AI",
      "What is AI"
    ]
  },
  {
    "domain": "AI & Data",
    "question": "What is machine learning?",
    "answer": "Machine learning is a branch of AI in which models learn patterns from data to make predictions or decisions instead of being explicitly programmed with every rule.",
    "aliases": [
      "Explain machine learning"
    ]
  },
  {
    "domain": "AI & Data",
    "question": "What is deep learning?",
    "answer": "Deep learning is a subset of machine learning that uses multi-layer neural networks to learn complex representations from large amounts of data. It powers many modern systems in vision, speech, and language.",
    "aliases": [
      "Explain deep learning"
    ]
  },
  {
    "domain": "AI & Data",
    "question": "What is a neural network?",
    "answer": "A neural network is a machine-learning model made of connected layers of numerical units. During training, it adjusts weights so inputs are transformed into useful predictions or representations.",
    "aliases": [
      "Explain neural networks"
    ]
  },
  {
    "domain": "AI & Data",
    "question": "What is a large language model?",
    "answer": "A large language model (LLM) is a neural network trained on large text datasets to predict and generate language. It can perform tasks such as answering questions, summarizing, writing, coding, and classification based on patterns learned during training.",
    "aliases": [
      "What is LLM",
      "Explain large language models"
    ]
  },
  {
    "domain": "AI & Data",
    "question": "What is supervised learning?",
    "answer": "Supervised learning trains a model using examples that include both inputs and known target outputs. The model learns a mapping that can then predict targets for new inputs.",
    "aliases": [
      "Explain supervised learning"
    ]
  },
  {
    "domain": "AI & Data",
    "question": "What is unsupervised learning?",
    "answer": "Unsupervised learning analyzes data without labeled target answers. It is used for tasks such as clustering, dimensionality reduction, anomaly detection, and discovering hidden structure.",
    "aliases": [
      "Explain unsupervised learning"
    ]
  },
  {
    "domain": "AI & Data",
    "question": "What is data science?",
    "answer": "Data science combines statistics, programming, domain knowledge, and communication to extract useful insights and build data-driven products or decisions.",
    "aliases": [
      "Explain data science"
    ]
  },
  {
    "domain": "AI & Data",
    "question": "What is SQL?",
    "answer": "SQL (Structured Query Language) is used to define, query, and manipulate data in relational databases. Common operations include `SELECT`, `INSERT`, `UPDATE`, `DELETE`, joins, grouping, and aggregation.",
    "aliases": [
      "Explain SQL"
    ]
  },
  {
    "domain": "AI & Data",
    "question": "What is a database?",
    "answer": "A database is an organized system for storing, retrieving, and managing data. Relational databases use tables and relationships, while NoSQL databases may use documents, key-value pairs, graphs, or other models.",
    "aliases": [
      "Explain database"
    ]
  },
  {
    "domain": "Science",
    "question": "What is photosynthesis?",
    "answer": "Photosynthesis is the process by which plants, algae, and some bacteria use light energy to convert carbon dioxide and water into energy-rich sugars, releasing oxygen as a by-product.",
    "aliases": [
      "Explain photosynthesis"
    ]
  },
  {
    "domain": "Science",
    "question": "Explain quantum computing in simple terms.",
    "answer": "Quantum computing uses quantum bits, or qubits, which can represent combinations of states and interact through phenomena such as superposition and entanglement. Quantum algorithms can exploit these effects to speed up certain specialized problems, but quantum computers are not faster for every task.",
    "aliases": [
      "What is quantum computing",
      "Explain quantum computing"
    ]
  },
  {
    "domain": "Science",
    "question": "What is gravity?",
    "answer": "Gravity is the attraction associated with mass and energy. In Einstein’s general relativity, matter and energy curve spacetime, and objects follow paths through that curved spacetime.",
    "aliases": [
      "Explain gravity"
    ]
  },
  {
    "domain": "Science",
    "question": "What is DNA?",
    "answer": "DNA, or deoxyribonucleic acid, is the molecule that stores hereditary information in most living organisms. Its sequence of bases contains instructions used in growth, function, reproduction, and protein production.",
    "aliases": [
      "Explain DNA"
    ]
  },
  {
    "domain": "Science",
    "question": "What is an atom?",
    "answer": "An atom is the basic unit of ordinary matter that retains the chemical properties of an element. It contains a nucleus of protons and neutrons surrounded by electrons.",
    "aliases": [
      "Explain atom"
    ]
  },
  {
    "domain": "Science",
    "question": "What is climate change?",
    "answer": "Climate change is a long-term shift in climate patterns. The current rapid warming trend is primarily driven by human greenhouse-gas emissions from activities such as burning fossil fuels and land-use change.",
    "aliases": [
      "Explain climate change"
    ]
  },
  {
    "domain": "Science",
    "question": "What is evolution?",
    "answer": "Biological evolution is the change in inherited characteristics of populations across generations. Mechanisms include natural selection, mutation, genetic drift, and gene flow.",
    "aliases": [
      "Explain evolution"
    ]
  },
  {
    "domain": "Science",
    "question": "What is the solar system?",
    "answer": "The Solar System consists of the Sun and the objects gravitationally bound to it, including eight planets, dwarf planets, moons, asteroids, comets, and smaller bodies.",
    "aliases": [
      "Explain solar system"
    ]
  },
  {
    "domain": "Science",
    "question": "Why is the sky blue?",
    "answer": "The sky appears blue because molecules in Earth’s atmosphere scatter shorter visible wavelengths more strongly than longer wavelengths. This Rayleigh scattering sends blue light toward our eyes from many directions.",
    "aliases": [
      "Why sky is blue"
    ]
  },
  {
    "domain": "Science",
    "question": "What is electricity?",
    "answer": "Electricity refers to phenomena involving electric charge. In circuits, electric current is the movement of charge, driven by a potential difference (voltage) through conductive paths.",
    "aliases": [
      "Explain electricity"
    ]
  },
  {
    "domain": "Mathematics",
    "question": "What is 238 multiplied by 47?",
    "answer": "238 × 47 = **11,186**. One way: 238 × 40 = 9,520 and 238 × 7 = 1,666; adding them gives 11,186.",
    "aliases": [
      "Calculate 238 x 47",
      "238*47"
    ]
  },
  {
    "domain": "Mathematics",
    "question": "What is 17 multiplied by 39?",
    "answer": "17 × 39 = **663**. Using 39 = 40 − 1: 17 × 40 = 680, then 680 − 17 = 663.",
    "aliases": [
      "Calculate 17 x 39",
      "17*39"
    ]
  },
  {
    "domain": "Mathematics",
    "question": "What is a prime number?",
    "answer": "A prime number is an integer greater than 1 with exactly two positive divisors: 1 and itself. Examples are 2, 3, 5, 7, 11, and 13.",
    "aliases": [
      "Explain prime numbers"
    ]
  },
  {
    "domain": "Mathematics",
    "question": "What is the Pythagorean theorem?",
    "answer": "For a right triangle with legs `a` and `b` and hypotenuse `c`, the Pythagorean theorem states `a² + b² = c²`.",
    "aliases": [
      "Explain Pythagorean theorem"
    ]
  },
  {
    "domain": "Mathematics",
    "question": "What is percentage?",
    "answer": "A percentage expresses a quantity as parts per hundred. For example, 25% means 25 out of 100, or 0.25 as a decimal.",
    "aliases": [
      "Explain percentage"
    ]
  },
  {
    "domain": "Mathematics",
    "question": "What is 20 percent of 250?",
    "answer": "20% of 250 is **50** because 0.20 × 250 = 50.",
    "aliases": [
      "Calculate 20% of 250",
      "20 percent of 250"
    ]
  },
  {
    "domain": "Mathematics",
    "question": "What is algebra?",
    "answer": "Algebra is a branch of mathematics that uses symbols and variables to represent numbers and relationships, allowing equations and general rules to be solved or manipulated.",
    "aliases": [
      "Explain algebra"
    ]
  },
  {
    "domain": "Mathematics",
    "question": "What is calculus?",
    "answer": "Calculus studies change and accumulation. Differential calculus focuses on rates of change and derivatives, while integral calculus focuses on accumulation, areas, and integrals.",
    "aliases": [
      "Explain calculus"
    ]
  },
  {
    "domain": "Mathematics",
    "question": "What is probability?",
    "answer": "Probability measures how likely an event is, usually on a scale from 0 (impossible) to 1 (certain), or from 0% to 100%.",
    "aliases": [
      "Explain probability"
    ]
  },
  {
    "domain": "Mathematics",
    "question": "What is mean median and mode?",
    "answer": "The **mean** is the arithmetic average, the **median** is the middle value after sorting, and the **mode** is the value that occurs most often.",
    "aliases": [
      "Explain mean median mode"
    ]
  },
  {
    "domain": "History & Geography",
    "question": "Explain World War II.",
    "answer": "World War II was a global conflict from 1939 to 1945 involving the Axis powers, led by Germany, Italy, and Japan, and the Allies, including Britain, the Soviet Union, China, the United States, and others. It included the Holocaust, enormous civilian and military losses, and ended with Axis defeat and a transformed international order.",
    "aliases": [
      "What was World War 2",
      "Explain WWII"
    ]
  },
  {
    "domain": "History & Geography",
    "question": "What was World War I?",
    "answer": "World War I was a major global war fought from 1914 to 1918, centered largely in Europe. It involved the Allied Powers and Central Powers and was driven by a complex mix of alliances, militarism, nationalism, imperial competition, and the assassination of Archduke Franz Ferdinand.",
    "aliases": [
      "Explain World War 1",
      "Explain WWI"
    ]
  },
  {
    "domain": "History & Geography",
    "question": "What was the Industrial Revolution?",
    "answer": "The Industrial Revolution was the transition from hand production and agrarian economies toward mechanized manufacturing, factories, and new transport and energy systems, beginning in Britain in the 18th century and spreading globally.",
    "aliases": [
      "Explain Industrial Revolution"
    ]
  },
  {
    "domain": "History & Geography",
    "question": "What is democracy?",
    "answer": "Democracy is a system of government in which political authority ultimately comes from the people, typically through elections, representation, rule of law, and protections for political participation and rights.",
    "aliases": [
      "Explain democracy"
    ]
  },
  {
    "domain": "History & Geography",
    "question": "What is the capital of Pakistan?",
    "answer": "The capital of Pakistan is **Islamabad**.",
    "aliases": [
      "Pakistan capital"
    ]
  },
  {
    "domain": "History & Geography",
    "question": "What is the capital of France?",
    "answer": "The capital of France is **Paris**.",
    "aliases": [
      "France capital"
    ]
  },
  {
    "domain": "History & Geography",
    "question": "What is the largest ocean?",
    "answer": "The **Pacific Ocean** is the largest ocean on Earth.",
    "aliases": [
      "Largest ocean in the world"
    ]
  },
  {
    "domain": "History & Geography",
    "question": "What is the largest continent?",
    "answer": "**Asia** is the largest continent by both land area and population.",
    "aliases": [
      "Largest continent in the world"
    ]
  },
  {
    "domain": "History & Geography",
    "question": "What is the United Nations?",
    "answer": "The United Nations (UN) is an international organization founded in 1945 to promote international peace and security, cooperation, human rights, development, and humanitarian action.",
    "aliases": [
      "Explain United Nations",
      "What is UN"
    ]
  },
  {
    "domain": "History & Geography",
    "question": "What is globalization?",
    "answer": "Globalization is the increasing interconnectedness of economies, societies, technologies, and cultures through trade, communication, migration, finance, and information flows.",
    "aliases": [
      "Explain globalization"
    ]
  },
  {
    "domain": "Career & Business",
    "question": "How can I become a frontend developer?",
    "answer": "Build strong fundamentals in HTML, CSS, and JavaScript, then learn Git, responsive design, accessibility, browser debugging, APIs, and a framework such as React or Vue. Create several real projects, deploy them, document your work on GitHub, and practice interviews and problem solving.",
    "aliases": [
      "How to become frontend developer"
    ]
  },
  {
    "domain": "Career & Business",
    "question": "Give me three final year project ideas.",
    "answer": "1. **AI Study Planner** — schedules tasks and tracks progress.\n2. **Smart Campus Helpdesk** — ticketing, search, analytics, and notifications.\n3. **Collaborative Code Review Platform** — teams upload code, discuss changes, and track review status.\n\nFor an FYP, choose one with measurable users, clear technical depth, and a realistic scope.",
    "aliases": [
      "Give me FYP ideas",
      "Final year project ideas"
    ]
  },
  {
    "domain": "Career & Business",
    "question": "How do I prepare for a job interview?",
    "answer": "Study the role and company, map your experience to the job requirements, prepare concise STAR examples, revise core technical concepts, practice common questions aloud, and prepare thoughtful questions for the interviewer.",
    "aliases": [
      "Job interview preparation"
    ]
  },
  {
    "domain": "Career & Business",
    "question": "What is a startup?",
    "answer": "A startup is a young company designed to develop and validate a scalable business model under uncertainty, usually while searching for strong product-market fit.",
    "aliases": [
      "Explain startup"
    ]
  },
  {
    "domain": "Career & Business",
    "question": "What is entrepreneurship?",
    "answer": "Entrepreneurship is the process of identifying an opportunity, organizing resources, taking calculated risks, and creating a product, service, or organization that delivers value.",
    "aliases": [
      "Explain entrepreneurship"
    ]
  },
  {
    "domain": "Career & Business",
    "question": "What is marketing?",
    "answer": "Marketing is the discipline of understanding customer needs and creating, communicating, distributing, and measuring value through positioning, product decisions, pricing, promotion, and channels.",
    "aliases": [
      "Explain marketing"
    ]
  },
  {
    "domain": "Career & Business",
    "question": "What is digital marketing?",
    "answer": "Digital marketing uses online channels such as search, websites, email, social media, content, and paid advertising to attract, engage, convert, and retain customers.",
    "aliases": [
      "Explain digital marketing"
    ]
  },
  {
    "domain": "Career & Business",
    "question": "What is SWOT analysis?",
    "answer": "SWOT analysis is a planning framework that identifies **Strengths**, **Weaknesses**, **Opportunities**, and **Threats**. Strengths and weaknesses are usually internal; opportunities and threats are usually external.",
    "aliases": [
      "Explain SWOT"
    ]
  },
  {
    "domain": "Career & Business",
    "question": "What is project management?",
    "answer": "Project management is the structured planning and coordination of scope, time, cost, people, risks, and communication to deliver a defined outcome.",
    "aliases": [
      "Explain project management"
    ]
  },
  {
    "domain": "Career & Business",
    "question": "How can I improve my communication skills?",
    "answer": "Practice active listening, organize your main point before speaking, use clear language, ask clarifying questions, adapt to your audience, seek feedback, and regularly practice writing and speaking in real situations.",
    "aliases": [
      "Improve communication skills"
    ]
  },
  {
    "domain": "Writing & Study",
    "question": "How do I write a professional email?",
    "answer": "Use a clear subject, a polite greeting, state the purpose early, keep the body concise, specify any action or deadline, and close professionally. Proofread names, dates, attachments, and tone before sending.",
    "aliases": [
      "Professional email tips"
    ]
  },
  {
    "domain": "Writing & Study",
    "question": "How do I write a good paragraph?",
    "answer": "Start with one clear topic sentence, support it with relevant evidence or explanation, connect ideas logically, and finish with a sentence that closes or transitions the point.",
    "aliases": [
      "How to write paragraph"
    ]
  },
  {
    "domain": "Writing & Study",
    "question": "What is plagiarism?",
    "answer": "Plagiarism is presenting someone else’s words, ideas, or work as your own without proper acknowledgment. Avoid it by citing sources, quoting accurately, and writing genuine paraphrases rather than superficial word substitutions.",
    "aliases": [
      "Explain plagiarism"
    ]
  },
  {
    "domain": "Writing & Study",
    "question": "How can I study effectively?",
    "answer": "Use active recall, spaced repetition, practice questions, short focused study blocks, and regular self-testing. Prioritize weak areas, remove distractions, sleep adequately, and review mistakes instead of only rereading notes.",
    "aliases": [
      "Effective study tips",
      "How to study effectively"
    ]
  },
  {
    "domain": "Writing & Study",
    "question": "What is active recall?",
    "answer": "Active recall is a study method where you retrieve information from memory without looking at the answer first. Flashcards, practice questions, and explaining a topic from memory are common forms.",
    "aliases": [
      "Explain active recall"
    ]
  },
  {
    "domain": "Writing & Study",
    "question": "What is spaced repetition?",
    "answer": "Spaced repetition schedules review at increasing intervals so information is revisited before it is forgotten. It is especially effective for long-term memory.",
    "aliases": [
      "Explain spaced repetition"
    ]
  },
  {
    "domain": "Writing & Study",
    "question": "How do I make a study schedule?",
    "answer": "List your subjects and deadlines, estimate available hours, prioritize difficult and high-value topics, assign focused blocks with breaks, include weekly review and practice, and leave buffer time for delays.",
    "aliases": [
      "Create study schedule tips"
    ]
  },
  {
    "domain": "Writing & Study",
    "question": "How do I improve my English?",
    "answer": "Practice all four skills regularly: read material slightly above your level, listen to natural English, speak even when imperfect, and write short pieces that you revise. Keep a vocabulary notebook and focus on useful phrases rather than isolated words.",
    "aliases": [
      "Improve English"
    ]
  },
  {
    "domain": "Writing & Study",
    "question": "How do I summarize a text?",
    "answer": "Identify the main idea and essential supporting points, remove repetition and minor examples, rewrite the information in your own words, and keep the summary much shorter than the original without changing its meaning.",
    "aliases": [
      "How to summarize"
    ]
  },
  {
    "domain": "Writing & Study",
    "question": "What is critical thinking?",
    "answer": "Critical thinking is the disciplined evaluation of claims and evidence. It involves checking assumptions, distinguishing facts from opinions, considering alternatives, identifying bias or weak reasoning, and reaching conclusions proportionate to the evidence.",
    "aliases": [
      "Explain critical thinking"
    ]
  },
  {
    "domain": "Computing & Security",
    "question": "What is cybersecurity?",
    "answer": "Cybersecurity is the practice of protecting systems, networks, applications, and data from unauthorized access, disruption, theft, and damage.",
    "aliases": [
      "Explain cybersecurity"
    ]
  },
  {
    "domain": "Computing & Security",
    "question": "What is phishing?",
    "answer": "Phishing is a social-engineering attack that impersonates a trusted person or organization to trick someone into revealing credentials, sending money, or opening malicious links or files.",
    "aliases": [
      "Explain phishing"
    ]
  },
  {
    "domain": "Computing & Security",
    "question": "What is a strong password?",
    "answer": "A strong password is long, unique, and difficult to guess. Prefer a password manager that generates unique passwords for every account, and enable multi-factor authentication where available.",
    "aliases": [
      "How to make strong password"
    ]
  },
  {
    "domain": "Computing & Security",
    "question": "What is two factor authentication?",
    "answer": "Two-factor authentication (2FA) requires two different forms of verification, such as a password plus an authenticator app or hardware key. It greatly reduces the risk from stolen passwords.",
    "aliases": [
      "Explain 2FA",
      "What is 2FA"
    ]
  },
  {
    "domain": "Computing & Security",
    "question": "What is cloud computing?",
    "answer": "Cloud computing delivers computing resources such as servers, storage, databases, and software over networks on demand, allowing organizations to scale without owning all underlying hardware.",
    "aliases": [
      "Explain cloud computing"
    ]
  },
  {
    "domain": "Computing & Security",
    "question": "What is an operating system?",
    "answer": "An operating system (OS) manages hardware resources and provides common services for applications. Examples include Windows, macOS, Linux, Android, and iOS.",
    "aliases": [
      "Explain operating system"
    ]
  },
  {
    "domain": "Computing & Security",
    "question": "What is RAM?",
    "answer": "RAM (Random Access Memory) is fast working memory used to hold data and programs that are actively being used. Its contents are normally lost when power is removed.",
    "aliases": [
      "Explain RAM"
    ]
  },
  {
    "domain": "Computing & Security",
    "question": "What is CPU?",
    "answer": "The CPU (Central Processing Unit) executes program instructions and coordinates much of a computer’s processing. Modern CPUs contain multiple cores, caches, and specialized execution units.",
    "aliases": [
      "Explain CPU"
    ]
  },
  {
    "domain": "Computing & Security",
    "question": "What is Git?",
    "answer": "Git is a distributed version-control system that tracks changes to files, supports branching and merging, and lets developers collaborate while preserving project history.",
    "aliases": [
      "Explain Git"
    ]
  },
  {
    "domain": "Computing & Security",
    "question": "What is GitHub?",
    "answer": "GitHub is a cloud platform built around Git repositories. It adds collaboration features such as pull requests, issues, code review, actions/CI, project management, and repository hosting.",
    "aliases": [
      "Explain GitHub"
    ]
  },
  {
    "domain": "General Knowledge",
    "question": "What is the internet?",
    "answer": "The internet is a global network of interconnected computer networks that communicate using standardized protocols such as TCP/IP. Services on it include the web, email, messaging, streaming, and many others.",
    "aliases": [
      "Explain internet"
    ]
  },
  {
    "domain": "General Knowledge",
    "question": "What is the difference between internet and web?",
    "answer": "The **internet** is the underlying global network infrastructure. The **World Wide Web** is one service that runs on the internet, using browsers, web servers, URLs, HTTP, and web pages.",
    "aliases": [
      "Internet vs web"
    ]
  },
  {
    "domain": "General Knowledge",
    "question": "What is blockchain?",
    "answer": "A blockchain is a distributed ledger in which records are grouped into blocks and cryptographically linked. Different blockchain systems use different consensus mechanisms to agree on valid updates.",
    "aliases": [
      "Explain blockchain"
    ]
  },
  {
    "domain": "General Knowledge",
    "question": "What is cryptocurrency?",
    "answer": "Cryptocurrency is a digital asset that uses cryptographic techniques and typically a distributed ledger to record ownership and transfers. Its risks and uses vary widely across projects.",
    "aliases": [
      "Explain cryptocurrency"
    ]
  },
  {
    "domain": "General Knowledge",
    "question": "What is time management?",
    "answer": "Time management is the deliberate planning and prioritization of how you use limited time. Effective methods include prioritizing outcomes, scheduling focused blocks, reducing context switching, and reviewing progress regularly.",
    "aliases": [
      "Explain time management"
    ]
  },
  {
    "domain": "General Knowledge",
    "question": "How can I be more productive?",
    "answer": "Choose a small number of important outcomes, break them into concrete next actions, schedule focused work, reduce notifications and multitasking, use checklists for repeated tasks, and review what actually moved your goals forward.",
    "aliases": [
      "Productivity tips",
      "How to improve productivity"
    ]
  },
  {
    "domain": "General Knowledge",
    "question": "What is teamwork?",
    "answer": "Teamwork is coordinated effort by people working toward a shared goal. Strong teamwork depends on clear roles, trust, communication, accountability, and constructive handling of disagreements.",
    "aliases": [
      "Explain teamwork"
    ]
  },
  {
    "domain": "General Knowledge",
    "question": "What is leadership?",
    "answer": "Leadership is the practice of creating direction, aligning people, making decisions, enabling others to perform, and taking responsibility for outcomes. It is not limited to formal job titles.",
    "aliases": [
      "Explain leadership"
    ]
  },
  {
    "domain": "General Knowledge",
    "question": "What is problem solving?",
    "answer": "Problem solving is the process of defining a problem, identifying constraints and root causes, generating possible solutions, evaluating trade-offs, implementing a choice, and checking whether it worked.",
    "aliases": [
      "Explain problem solving"
    ]
  },
  {
    "domain": "General Knowledge",
    "question": "What is communication?",
    "answer": "Communication is the exchange of information, meaning, or intent between people or systems. Effective human communication depends on clarity, listening, context, feedback, and an appropriate channel.",
    "aliases": [
      "Explain communication"
    ]
  }
];

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[`*_#>~]/g, " ")
      .replace(/[^a-z0-9%+]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokens(text) {
    return new Set(normalize(text).split(" ").filter(function (x) { return x.length > 1; }));
  }

  function similarity(a, b) {
    const A = tokens(a), B = tokens(b);
    if (!A.size || !B.size) return 0;
    let common = 0;
    A.forEach(function (x) { if (B.has(x)) common++; });
    const union = new Set(Array.from(A).concat(Array.from(B))).size;
    const containment = common / Math.min(A.size, B.size);
    const jaccard = common / union;
    return containment * 0.72 + jaccard * 0.28;
  }

  function candidates(item) { return [item.question].concat(item.aliases || []); }

  function findAnswer(question) {
    const q = normalize(question);
    if (!q) return null;
    let best = null, bestScore = 0;
    KNOWLEDGE.forEach(function (item) {
      candidates(item).forEach(function (form) {
        const n = normalize(form);
        if (q === n) { best = item; bestScore = 1; return; }
        const score = similarity(q, n);
        if (score > bestScore) { best = item; bestScore = score; }
      });
    });
    return bestScore >= 0.64 ? { item: best, score: bestScore } : null;
  }

  function lastUserText(history) {
    const list = Array.isArray(history) ? history : [];
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i] && list[i].from === "me" && list[i].text) return list[i].text;
    }
    return "";
  }

  function helpText() {
    const groups = {};
    KNOWLEDGE.forEach(function (x) { (groups[x.domain] || (groups[x.domain] = [])).push(x.question); });
    return "**TalkBox built-in knowledge is ready — 100 predefined questions, no API key needed.**\n\n" +
      "You can ask questions from these domains: **" + Object.keys(groups).join(", ") + "**.\n\n" +
      "Try: `What is Java?`, `Explain quantum computing in simple terms.`, `What is 238 multiplied by 47?`, `How can I become a frontend developer?`, or `What is cybersecurity?`";
  }

  async function reply(history) {
    const q = lastUserText(history);
    const n = normalize(q);
    if (n === "reply with the single word ready" || n === "ready") return { text: "ready", mode: "live" };
    if (/^(help|what can you do|show questions|list questions|questions)$/.test(n)) return { text: helpText(), mode: "live" };
    const hit = findAnswer(q);
    if (hit) return { text: hit.item.answer, mode: "live", source: "predefined", domain: hit.item.domain };
    return {
      mode: "limited",
      text: "I currently have a **100-question built-in knowledge pack** and this question is not one of the predefined matches. Try asking a question from programming, web development, AI/data, science, mathematics, history/geography, careers/business, writing/study, computing/security, or general knowledge. Type **`What can you do?`** for examples."
    };
  }

  const cfg = { provider: "talkbox", serviceUrl: "", baseUrl: "", model: "TalkBox 100Q", apiKey: "" };
  return {
    reply: reply,
    config: function () { return Object.assign({}, cfg); },
    setConfig: function () { return Object.assign({}, cfg); },
    defaultServiceUrl: function () { return "built-in"; },
    endpointLabel: function () { return "built-in browser knowledge pack"; },
    modelLabel: function () { return "TalkBox 100-question knowledge pack"; },
    isConfigured: function () { return true; },
    usingService: function () { return true; },
    isLive: function () { return true; },
    modeLabel: function () { return "Knowledge pack ready"; },
    knowledgeCount: function () { return KNOWLEDGE.length; },
    knowledge: function () { return KNOWLEDGE.slice(); }
  };
})();
