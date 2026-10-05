import "server-only";
import type { Section } from "./config";

// The five question papers of the eligibility assessment.
// Each paper has 40 questions: 10 English language (EN), 10 general knowledge (GK),
// 10 mathematics & IQ (MA) and 10 about Germany (DE).
// `a` is the index (0–3) of the correct option. This file is only loaded on the server,
// so the correct answers never reach the applicant's browser.
// Options are shuffled for every attempt, so the order written here does not matter.

export type Question = { s: Section; q: string; o: [string, string, string, string]; a: 0 | 1 | 2 | 3 };

const q = (s: Section, text: string, o: [string, string, string, string], a: 0 | 1 | 2 | 3): Question => ({ s, q: text, o, a });

const PAPER_1: Question[] = [
  // English
  q("EN", "Choose the correct word: \"She ___ to work every day.\"", ["go", "goes", "going", "gone"], 1),
  q("EN", "Which word is closest in meaning to \"rapid\"?", ["slow", "quick", "heavy", "quiet"], 1),
  q("EN", "\"If I ___ more time, I would learn German faster.\"", ["have", "had", "will have", "having"], 1),
  q("EN", "Which word is the opposite of \"expensive\"?", ["cheap", "costly", "rich", "valuable"], 0),
  q("EN", "Which word is spelled correctly?", ["recieve", "receive", "receeve", "riceive"], 1),
  q("EN", "\"He has lived in Colombo ___ 2015.\"", ["for", "since", "from", "at"], 1),
  q("EN", "Choose the passive form of: \"The manager signed the contract.\"", ["The contract signed the manager.", "The contract was signed by the manager.", "The contract is signing by the manager.", "The manager was signed by the contract."], 1),
  q("EN", "\"I am looking forward ___ you.\"", ["to meet", "meeting", "to meeting", "meet"], 2),
  q("EN", "What does \"deadline\" mean?", ["A dangerous line", "The latest time by which something must be done", "The end of a road", "A type of contract"], 1),
  q("EN", "Which sentence is correct?", ["There is many people here.", "There are many people here.", "There are much people here.", "There is much peoples here."], 1),
  // General knowledge
  q("GK", "Which is the largest ocean on Earth?", ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"], 2),
  q("GK", "Which planet is known as the Red Planet?", ["Venus", "Mars", "Jupiter", "Saturn"], 1),
  q("GK", "What is the chemical formula of water?", ["H2O", "CO2", "O2", "NaCl"], 0),
  q("GK", "Who painted the Mona Lisa?", ["Michelangelo", "Leonardo da Vinci", "Raphael", "Pablo Picasso"], 1),
  q("GK", "How many continents are there?", ["5", "6", "7", "8"], 2),
  q("GK", "What is the currency of Japan?", ["Yuan", "Won", "Yen", "Ringgit"], 2),
  q("GK", "What is the largest organ of the human body?", ["Heart", "Liver", "Skin", "Lungs"], 2),
  q("GK", "In which city are the headquarters of the United Nations?", ["Geneva", "New York", "Paris", "Vienna"], 1),
  q("GK", "Which gas do plants take from the air for photosynthesis?", ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], 2),
  q("GK", "The speed of light is approximately:", ["300,000 km per second", "30,000 km per second", "3,000 km per second", "300 km per second"], 0),
  // Mathematics & IQ
  q("MA", "What is 15% of 200?", ["20", "25", "30", "35"], 2),
  q("MA", "What comes next: 2, 4, 8, 16, ?", ["24", "30", "32", "36"], 2),
  q("MA", "A train travels 120 km in 2 hours. What is its average speed?", ["40 km/h", "60 km/h", "80 km/h", "100 km/h"], 1),
  q("MA", "7 × 8 − 6 = ?", ["48", "50", "52", "56"], 1),
  q("MA", "Which is the odd one out?", ["Apple", "Banana", "Carrot", "Mango"], 2),
  q("MA", "All Bloops are Razzies and all Razzies are Lazzies. Therefore all Bloops are definitely:", ["Lazzies", "Not Razzies", "Neither Razzies nor Lazzies", "It cannot be determined"], 0),
  q("MA", "Solve: 3x + 5 = 20", ["x = 3", "x = 4", "x = 5", "x = 6"], 2),
  q("MA", "What comes next: 1, 1, 2, 3, 5, 8, ?", ["11", "12", "13", "14"], 2),
  q("MA", "A shirt costs €40 after a 20% discount. What was the original price?", ["€48", "€50", "€52", "€60"], 1),
  q("MA", "A clock shows exactly 3:00. What is the angle between the hands?", ["45°", "60°", "90°", "120°"], 2),
  // Germany
  q("DE", "What is the capital of Germany?", ["Munich", "Hamburg", "Berlin", "Frankfurt"], 2),
  q("DE", "What is the currency of Germany?", ["Deutsche Mark", "Euro", "Franc", "Krone"], 1),
  q("DE", "What are the colours of the German flag, from top to bottom?", ["Black, red, gold", "Red, white, black", "Black, white, red", "Gold, red, black"], 0),
  q("DE", "On which date is the Day of German Unity celebrated?", ["3 October", "9 November", "1 May", "17 June"], 0),
  q("DE", "Which is the longest river in Germany?", ["Elbe", "Weser", "Rhine", "Main"], 2),
  q("DE", "How many federal states (Bundesländer) does Germany have?", ["12", "14", "16", "18"], 2),
  q("DE", "In which year did the Berlin Wall fall?", ["1985", "1989", "1990", "1991"], 1),
  q("DE", "What is the EU Blue Card?", ["A tourist visa", "A residence permit for highly qualified non-EU workers", "A German driving licence", "A student loan card"], 1),
  q("DE", "Which telephone number do you call for the police in Germany?", ["110", "112", "911", "119"], 0),
  q("DE", "Which telephone number do you call for the fire brigade or an ambulance in Germany?", ["110", "112", "911", "999"], 1),
];

const PAPER_2: Question[] = [
  // English
  q("EN", "\"They ___ football when it started to rain.\"", ["play", "were playing", "have played", "are playing"], 1),
  q("EN", "Which word is closest in meaning to \"assist\"?", ["help", "refuse", "ignore", "delay"], 0),
  q("EN", "\"This is the ___ book I have ever read.\"", ["good", "better", "best", "most good"], 2),
  q("EN", "\"Neither the manager nor the employees ___ present.\"", ["was", "were", "is", "be"], 1),
  q("EN", "Which word is the opposite of \"accept\"?", ["receive", "reject", "allow", "agree"], 1),
  q("EN", "\"She asked me where ___.\"", ["do I live", "I lived", "did I live", "I am live"], 1),
  q("EN", "Which word is spelled correctly?", ["accomodation", "acommodation", "accommodation", "acomodation"], 2),
  q("EN", "\"By next year, I ___ my degree.\"", ["finish", "will have finished", "finished", "have finish"], 1),
  q("EN", "What does \"reliable\" mean?", ["Can be trusted", "Very expensive", "Easily broken", "Hard to find"], 0),
  q("EN", "\"He is good ___ mathematics.\"", ["in", "at", "on", "for"], 1),
  // General knowledge
  q("GK", "Which is the highest mountain on Earth?", ["K2", "Kangchenjunga", "Mount Everest", "Kilimanjaro"], 2),
  q("GK", "Who developed the theory of relativity?", ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Galileo Galilei"], 1),
  q("GK", "Which is the largest country by area?", ["Canada", "China", "United States", "Russia"], 3),
  q("GK", "How many days are there in a leap year?", ["364", "365", "366", "367"], 2),
  q("GK", "Which organ pumps blood around the body?", ["Brain", "Heart", "Kidney", "Lung"], 1),
  q("GK", "At sea level, water boils at:", ["90 °C", "100 °C", "110 °C", "120 °C"], 1),
  q("GK", "Which of these is a renewable source of energy?", ["Coal", "Natural gas", "Solar power", "Oil"], 2),
  q("GK", "What is the capital of Australia?", ["Sydney", "Melbourne", "Canberra", "Perth"], 2),
  q("GK", "Which is the hardest natural substance?", ["Gold", "Iron", "Diamond", "Quartz"], 2),
  q("GK", "What does WHO stand for?", ["World Health Organization", "World Housing Office", "Worldwide Health Office", "World Help Organization"], 0),
  // Mathematics & IQ
  q("MA", "What is 25% of 360?", ["80", "90", "100", "120"], 1),
  q("MA", "What comes next: 3, 6, 12, 24, ?", ["36", "42", "48", "54"], 2),
  q("MA", "144 ÷ 12 = ?", ["10", "11", "12", "14"], 2),
  q("MA", "5 workers build a wall in 8 days. Working at the same rate, how many days do 10 workers need?", ["2", "4", "8", "16"], 1),
  q("MA", "Which is the odd one out?", ["Square", "Triangle", "Circle", "Cube"], 3),
  q("MA", "What comes next: A, C, E, G, ?", ["H", "I", "J", "K"], 1),
  q("MA", "What is the area of a rectangle 8 m long and 5 m wide?", ["13 m²", "26 m²", "40 m²", "45 m²"], 2),
  q("MA", "Book is to reading as fork is to:", ["drawing", "writing", "eating", "stirring"], 2),
  q("MA", "A price rises from 80 to 100. What is the percentage increase?", ["20%", "25%", "30%", "80%"], 1),
  q("MA", "What is the average of 4, 8 and 12?", ["6", "8", "10", "12"], 1),
  // Germany
  q("DE", "Which is the largest city in Germany by population?", ["Hamburg", "Munich", "Berlin", "Cologne"], 2),
  q("DE", "How many countries share a land border with Germany?", ["7", "8", "9", "10"], 2),
  q("DE", "What is the title of the head of the German federal government?", ["President", "Federal Chancellor", "Prime Minister", "King"], 1),
  q("DE", "What is the name of the German federal parliament?", ["Bundestag", "Senate", "Duma", "Congress"], 0),
  q("DE", "Which famous festival takes place every year in Munich?", ["Carnival", "Oktoberfest", "Berlinale", "Kieler Woche"], 1),
  q("DE", "Which of these car brands is German?", ["Toyota", "Volkswagen", "Hyundai", "Volvo"], 1),
  q("DE", "What does the German word \"Danke\" mean?", ["Hello", "Please", "Thank you", "Goodbye"], 2),
  q("DE", "In which year was Germany reunified?", ["1989", "1990", "1991", "1949"], 1),
  q("DE", "Which is the highest mountain in Germany?", ["Brocken", "Zugspitze", "Feldberg", "Watzmann"], 1),
  q("DE", "For employees in Germany, health insurance is:", ["Optional", "Compulsory", "Only for German citizens", "Only for families"], 1),
];

const PAPER_3: Question[] = [
  // English
  q("EN", "\"I ___ never been to Germany.\"", ["has", "have", "am", "was"], 1),
  q("EN", "Which word is closest in meaning to \"begin\"?", ["finish", "start", "stop", "end"], 1),
  q("EN", "\"He doesn't like coffee, and ___ do I.\"", ["so", "neither", "either", "also"], 1),
  q("EN", "Which word is the opposite of \"increase\"?", ["raise", "grow", "decrease", "expand"], 2),
  q("EN", "\"The letter ___ yesterday.\"", ["was sent", "is sent", "sent", "has send"], 0),
  q("EN", "Which word is spelled correctly?", ["goverment", "government", "govenment", "guvernment"], 1),
  q("EN", "\"You ___ wear a helmet; it is the law.\"", ["might", "must", "could", "would"], 1),
  q("EN", "What is the plural of \"child\"?", ["childs", "children", "childes", "child"], 1),
  q("EN", "What does \"fluent\" mean?", ["Able to speak a language easily and well", "Speaking slowly", "Unable to speak", "Speaking loudly"], 0),
  q("EN", "Which of these words is an adverb?", ["quick", "quickly", "quickness", "quicker"], 1),
  // General knowledge
  q("GK", "Which is the smallest planet in our solar system?", ["Mercury", "Mars", "Venus", "Neptune"], 0),
  q("GK", "Who is credited with inventing the telephone?", ["Thomas Edison", "Alexander Graham Bell", "Guglielmo Marconi", "James Watt"], 1),
  q("GK", "Which river is usually named as the longest in the world?", ["Amazon", "Nile", "Yangtze", "Mississippi"], 1),
  q("GK", "How many bones are there in the adult human body?", ["186", "206", "226", "256"], 1),
  q("GK", "Water freezes at:", ["0 °F", "32 °F", "100 °F", "212 °F"], 1),
  q("GK", "What is the capital of Canada?", ["Toronto", "Vancouver", "Ottawa", "Montreal"], 2),
  q("GK", "Which vitamin does the skin produce when exposed to sunlight?", ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"], 3),
  q("GK", "Which is the largest hot desert in the world?", ["Gobi", "Kalahari", "Sahara", "Thar"], 2),
  q("GK", "Which of these animals is a mammal?", ["Shark", "Dolphin", "Octopus", "Salmon"], 1),
  q("GK", "What does CPU stand for?", ["Central Processing Unit", "Computer Power Unit", "Central Program Utility", "Control Processing Unit"], 0),
  // Mathematics & IQ
  q("MA", "0.5 × 0.4 = ?", ["0.02", "0.2", "2", "0.9"], 1),
  q("MA", "What comes next: 100, 95, 85, 70, ?", ["50", "55", "60", "45"], 0),
  q("MA", "2³ + 3² = ?", ["12", "15", "17", "18"], 2),
  q("MA", "A class has 30 students and the ratio of boys to girls is 3 : 2. How many girls are there?", ["10", "12", "15", "18"], 1),
  q("MA", "Which number is the odd one out?", ["2", "3", "5", "9"], 3),
  q("MA", "If CAT is written as 3-1-20, how is DOG written?", ["4-15-7", "4-14-7", "3-15-7", "4-15-8"], 0),
  q("MA", "What is the simple interest on 1,000 at 5% per year for 2 years?", ["50", "100", "105", "110"], 1),
  q("MA", "How many hours are there in 3 days?", ["48", "60", "72", "84"], 2),
  q("MA", "Doctor is to hospital as teacher is to:", ["book", "school", "student", "lesson"], 1),
  q("MA", "What is the perimeter of a square with sides of 7 cm?", ["14 cm", "21 cm", "28 cm", "49 cm"], 2),
  // Germany
  q("DE", "Munich is the capital of which German state?", ["Hesse", "Bavaria", "Saxony", "Baden-Württemberg"], 1),
  q("DE", "Who was the first Federal Chancellor of the Federal Republic of Germany?", ["Willy Brandt", "Konrad Adenauer", "Helmut Kohl", "Ludwig Erhard"], 1),
  q("DE", "In which year was the German constitution (Grundgesetz) adopted?", ["1945", "1949", "1955", "1990"], 1),
  q("DE", "In which German city is the European Central Bank located?", ["Berlin", "Bonn", "Frankfurt am Main", "Stuttgart"], 2),
  q("DE", "What does \"Guten Morgen\" mean?", ["Good night", "Good morning", "Good evening", "Goodbye"], 1),
  q("DE", "Germany has coastlines on the Baltic Sea and the:", ["North Sea", "Mediterranean Sea", "Black Sea", "Adriatic Sea"], 0),
  q("DE", "Germany was a founding member of which organisation?", ["The European Economic Community (today's EU)", "ASEAN", "OPEC", "The Commonwealth"], 0),
  q("DE", "Which famous composer was born in Bonn?", ["Wolfgang Amadeus Mozart", "Ludwig van Beethoven", "Frédéric Chopin", "Antonio Vivaldi"], 1),
  q("DE", "After moving into a flat in Germany, where do you register your address (Anmeldung)?", ["At the residents' registration office (Bürgeramt)", "At the post office", "At your bank", "At the police station"], 0),
  q("DE", "German language skills are described with CEFR levels. Which of these is the highest level?", ["A1", "B1", "B2", "C2"], 3),
];

const PAPER_4: Question[] = [
  // English
  q("EN", "\"We ___ dinner when the phone rang.\"", ["have", "were having", "are having", "has had"], 1),
  q("EN", "Which word is closest in meaning to \"purchase\"?", ["sell", "buy", "borrow", "lend"], 1),
  q("EN", "\"Could you tell me what time ___?\"", ["does the train leave", "the train leaves", "leaves the train", "did the train leave"], 1),
  q("EN", "Which word is the opposite of \"arrive\"?", ["reach", "depart", "come", "enter"], 1),
  q("EN", "\"The more you practise, the ___ you become.\"", ["good", "better", "best", "well"], 1),
  q("EN", "Which word is spelled correctly?", ["necessary", "neccessary", "necesary", "neccesary"], 0),
  q("EN", "\"She is interested ___ learning languages.\"", ["on", "in", "at", "about"], 1),
  q("EN", "\"If it rains tomorrow, we ___ at home.\"", ["stay", "will stay", "would stay", "stayed"], 1),
  q("EN", "What is a \"colleague\"?", ["A relative", "A person you work with", "A teacher", "A customer"], 1),
  q("EN", "Which sentence is correct?", ["He don't like tea.", "He doesn't likes tea.", "He doesn't like tea.", "He not like tea."], 2),
  // General knowledge
  q("GK", "Which star is closest to the Earth?", ["Polaris", "Sirius", "The Sun", "Alpha Centauri"], 2),
  q("GK", "Who wrote \"Romeo and Juliet\"?", ["Charles Dickens", "William Shakespeare", "Mark Twain", "Leo Tolstoy"], 1),
  q("GK", "Which blood cells help the body fight infections?", ["Red blood cells", "White blood cells", "Platelets", "Plasma"], 1),
  q("GK", "On which continent is Egypt?", ["Asia", "Africa", "Europe", "South America"], 1),
  q("GK", "What is the main language of Brazil?", ["Spanish", "Portuguese", "English", "French"], 1),
  q("GK", "How many minutes are there in one day?", ["1,240", "1,440", "1,640", "2,400"], 1),
  q("GK", "Which gas makes up most of the Earth's atmosphere?", ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"], 2),
  q("GK", "In which country is Mount Fuji?", ["China", "Japan", "South Korea", "Nepal"], 1),
  q("GK", "What is the unit of electric current?", ["Volt", "Watt", "Ampere", "Ohm"], 2),
  q("GK", "How many players of one football team are on the field at the same time?", ["9", "10", "11", "12"], 2),
  // Mathematics & IQ
  q("MA", "What is 12.5% of 800?", ["80", "100", "120", "125"], 1),
  q("MA", "What comes next: 1, 4, 9, 16, 25, ?", ["30", "36", "42", "49"], 1),
  q("MA", "9 × 12 = ?", ["96", "108", "112", "118"], 1),
  q("MA", "A car uses 6 litres of fuel per 100 km. How much fuel does it need for 350 km?", ["18 litres", "21 litres", "24 litres", "35 litres"], 1),
  q("MA", "Which is the odd one out?", ["Euro", "Dollar", "Rupee", "Kilogram"], 3),
  q("MA", "What comes next: Z, X, V, T, ?", ["S", "R", "Q", "P"], 1),
  q("MA", "If x ÷ 4 = 9, what is x?", ["13", "32", "36", "40"], 2),
  q("MA", "Today is Monday. Which day will it be in 10 days?", ["Wednesday", "Thursday", "Friday", "Tuesday"], 1),
  q("MA", "Bird is to nest as bee is to:", ["flower", "hive", "honey", "tree"], 1),
  q("MA", "What is half of a quarter of 160?", ["20", "40", "10", "80"], 0),
  // Germany
  q("DE", "Which city was the capital of West Germany?", ["Berlin", "Bonn", "Frankfurt", "Cologne"], 1),
  q("DE", "Approximately how many people live in Germany?", ["43 million", "63 million", "84 million", "120 million"], 2),
  q("DE", "In which city is the Brandenburg Gate?", ["Hamburg", "Berlin", "Dresden", "Potsdam"], 1),
  q("DE", "What is the German \"Autobahn\"?", ["A type of train", "The motorway network", "A kind of bread", "A public holiday"], 1),
  q("DE", "What does the German word \"Arbeitsvertrag\" mean?", ["Employment contract", "Rental contract", "Work permit", "Salary slip"], 0),
  q("DE", "On which side of the road do vehicles drive in Germany?", ["Left", "Right", "Either side", "It depends on the state"], 1),
  q("DE", "Which famous physicist discovered X-rays in Germany in 1895?", ["Max Planck", "Wilhelm Conrad Röntgen", "Werner Heisenberg", "Robert Koch"], 1),
  q("DE", "Which of these is a German federal state (Bundesland)?", ["Tyrol", "Saxony", "Alsace", "Bohemia"], 1),
  q("DE", "Which river flows through Hamburg?", ["Rhine", "Elbe", "Main", "Danube"], 1),
  q("DE", "What is the \"Bundesagentur für Arbeit\"?", ["The Federal Employment Agency", "The Federal Bank", "The Federal Police", "The Tax Office"], 0),
];

const PAPER_5: Question[] = [
  // English
  q("EN", "\"She ___ English for five years.\"", ["studies", "has been studying", "is study", "study"], 1),
  q("EN", "Which word is closest in meaning to \"difficult\"?", ["easy", "hard", "simple", "light"], 1),
  q("EN", "\"I wish I ___ speak German.\"", ["can", "could", "will", "am"], 1),
  q("EN", "Which word is the opposite of \"temporary\"?", ["permanent", "short", "brief", "quick"], 0),
  q("EN", "\"Each of the students ___ a laptop.\"", ["have", "has", "are having", "were having"], 1),
  q("EN", "Which word is spelled correctly?", ["beginning", "begining", "beggining", "beginnig"], 0),
  q("EN", "\"He apologised ___ being late.\"", ["for", "of", "about", "to"], 0),
  q("EN", "\"How ___ experience does this job require?\"", ["many", "much", "few", "a lot"], 1),
  q("EN", "What does \"salary\" mean?", ["Money paid regularly for work", "A tax", "A bank loan", "A one-time bonus"], 0),
  q("EN", "Choose the correct question tag: \"You are coming, ___?\"", ["are you", "aren't you", "isn't it", "don't you"], 1),
  // General knowledge
  q("GK", "Which planet is famous for its large rings?", ["Mars", "Saturn", "Mercury", "Venus"], 1),
  q("GK", "Who discovered penicillin?", ["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Edward Jenner"], 1),
  q("GK", "How many sides does a hexagon have?", ["5", "6", "7", "8"], 1),
  q("GK", "Which is the largest animal on Earth?", ["African elephant", "Blue whale", "Giraffe", "Great white shark"], 1),
  q("GK", "In which country is the Great Wall?", ["India", "China", "Mongolia", "Japan"], 1),
  q("GK", "Which gas do humans breathe out more of than they breathe in?", ["Oxygen", "Carbon dioxide", "Nitrogen", "Helium"], 1),
  q("GK", "What does \"www\" stand for in a web address?", ["World Wide Web", "Wide World Web", "Web World Wide", "World Web Wide"], 0),
  q("GK", "What is the capital of Italy?", ["Milan", "Rome", "Venice", "Naples"], 1),
  q("GK", "Which instrument is used to measure temperature?", ["Barometer", "Thermometer", "Speedometer", "Hygrometer"], 1),
  q("GK", "How often are the Summer Olympic Games held?", ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], 2),
  // Mathematics & IQ
  q("MA", "What is 40% of 250?", ["80", "100", "120", "150"], 1),
  q("MA", "What comes next: 5, 10, 20, 35, 55, ?", ["70", "75", "80", "85"], 2),
  q("MA", "1,000 − 375 = ?", ["525", "625", "635", "725"], 1),
  q("MA", "3 pens cost €4.50. How much do 7 pens cost?", ["€9.50", "€10.50", "€11.00", "€12.00"], 1),
  q("MA", "Which month is the odd one out?", ["January", "March", "June", "July"], 2),
  q("MA", "Some managers are engineers, and all engineers are graduates. Which statement must be true?", ["All managers are graduates", "Some managers are graduates", "No managers are graduates", "All graduates are engineers"], 1),
  q("MA", "What is the square root of 81?", ["7", "8", "9", "10"], 2),
  q("MA", "A meeting starts at 09:45 and lasts 2 hours 30 minutes. When does it end?", ["11:15", "12:00", "12:15", "12:30"], 2),
  q("MA", "Hand is to glove as foot is to:", ["toe", "sock", "leg", "walk"], 1),
  q("MA", "How many metres are there in 2.5 kilometres?", ["25", "250", "2,500", "25,000"], 2),
  // Germany
  q("DE", "Which is the largest German state by area?", ["Bavaria", "Lower Saxony", "North Rhine-Westphalia", "Saxony"], 0),
  q("DE", "Which German state has the most inhabitants?", ["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Berlin"], 1),
  q("DE", "Who is the head of state of Germany?", ["The Federal Chancellor", "The Federal President", "The President of the Bundestag", "A Minister-President"], 1),
  q("DE", "What is the international dialling code for Germany?", ["+41", "+43", "+49", "+31"], 2),
  q("DE", "What does \"Wie geht es Ihnen?\" mean?", ["What is your name?", "How are you?", "Where are you from?", "How old are you?"], 1),
  q("DE", "Which German city is famous for its great cathedral and its carnival?", ["Cologne", "Leipzig", "Bremen", "Kiel"], 0),
  q("DE", "Which mountain range lies along Germany's southern border?", ["The Alps", "The Pyrenees", "The Carpathians", "The Urals"], 0),
  q("DE", "What is the German word for the yearly income tax return?", ["Steuererklärung", "Krankenkasse", "Mietvertrag", "Führerschein"], 0),
  q("DE", "Which of these countries does NOT border Germany?", ["Austria", "Poland", "Italy", "Denmark"], 2),
  q("DE", "Martin Luther is best known in German history for:", ["The Protestant Reformation", "German reunification", "Founding the Bundestag", "Inventing the printing press"], 0),
];

export const PAPERS: Question[][] = [PAPER_1, PAPER_2, PAPER_3, PAPER_4, PAPER_5];

/** Paper numbers start at 1. */
export function getPaper(n: number): Question[] {
  const p = PAPERS[n - 1];
  if (!p) throw new Error(`Unknown assessment paper ${n}`);
  return p;
}
