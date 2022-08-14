import getRandomElement, { getRandomElements } from "./getRandomElement";

const names = [
  "Anthony Stark",
  "Thor Odinson👌",
  "Janet van Dyne",
  'Dr. Henry Jonathan "Hank" Pym',
  "Bruce Banner",
  "Clinton Barton",
  "Steve Rogers👍",
  "Wanda Maximoff",
  "T'Challa",
  "Peter Parker",
  "Renée Mary-Jo",
  "Noël",
  "Sørina",
  "François",
  "Jokūbas",
  "Siân",
];
const schools = [
  null,
  "University of Texas",
  "UT",
  "Texas A&M University",
  "Princeton University",
  "Harvard University",
  "A Really Long University Name of the College of Engineering for Penguins in Antarctica School",
];
const majors = [
  null,
  "Computer Science",
  "Math",
  "Agricultural Economics",
  "Penguins",
  "Pre-Law",
  "Physics",
  "Aerospace Engineering",
  "Journalism",
  "Anthropology",
];
const classStandings = [
  null,
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Other",
];
const skills = [
  "C++",
  "Python",
  "Making Pancakes",
  "SQL",
  "JavaScript",
  "React",
  "Singing",
  "Scribblio",
  "Cup Stacking",
  "Programming",
  "Creative Writing",
  "Running",
  "COBOL",
];
const experienceLevels = [null, "Beginner", "Intermediate", "Advanced"];
const intros = [
  null,
  "About Me:\n\n✎ I'm a writer, artist, and father of three. I’ve been seeking balance in my life since I started my career over 25 years ago. I started my own digital agency in 2018 to build the working culture I always wanted. Today, is the happiest day of my life.\n\n✎ At school, I found beauty in maths and art. I graduated university in 1998 with degrees in marketing and law. I've worked as both a lawyer and marketer but I'm significantly more dangerous at a computer than the bar table. These days, I speak to lawyers about marketing.\n\n✎ I run a modern-day digital agency working with a few select businesses. I've worked with media companies like Facebook, Google, Amazon and Twitter.",
  "I am a Data Science intern in research and development at QMSC and a Data Science teaching fellow in the UNT Department of Information Science. I serve as the president of the Data Science Organization at the University of North Texas. My research background is in Machine Learning (Deep Learning), Data Mining, and Advanced Statistics. I want to solve data and information-related issues with my acquired knowledge in data science.",
  "Cancer Researcher, co-inventor and research project lead for Lorbrena (lorlatinib).",
  "I lead a worldwide team that enables colleges and universities to teach the large system skills in enterprise computing that the world's largest companies are looking to hire. We give away free SW, courseware and access to HW to faculty to enable their enterprise computing courses. Then we connect their students to local employers looking for these highly sought after skills.",
  "Consulting IT Specialist and Sr. Software Engineer with a history of industry accomplishments. Previous experience includes management, project management, and deep technical skills in IBM Z, z/OS, z/VM and Linux.",
  "Hello! I'm a design + production consultant based in Seattle, WA. I create innovative experiences to help drive meaningful impact.\n\nI currently work as an experience consultant at Salesforce.\n\nI've always been driven to redefine the way people interact with modern media - constantly seeking ways to express new ideas and concepts, simpler and easier.\n\nIn addition to my UX work, I work professionally as a technical director and designer at regional theatre companies (portfolio). My focus is to reenvision the way that ideas are portrayed through the mediums of light, sound, and visual perception.\n\nLastly, I'm an avid activist in areas of environmental protection, human rights, and animal rights (especially whales).",
  "Senior Experience Consultant with a passion for collaborative innovation. I leverage the human-centered design process to find solutions for the wicked problems of the world. Experienced in design, research, strategy, various coding languages, and a little bit of bass guitar. Based in Orange County, CA 🍊 🏖️ ",
  "Computer scientist and backend software engineer. Fundamentally a systems level thinker with a passion for improving both the technical and human environments which produce great software.\n\nI aim to use my skills and knowledge to improve human living conditions, now and in the future, by bringing the value of software to socially beneficial organizations and industries.\n\nCurrently I am practicing this with my company's Social Impact team: building relationships between our company and local and global non-profits/charities, organizing and running short and long term pro bono projects, and championing new ways to strengthen the company's execution on it's 1% pledge. https://www.pagerduty.com/foundation/.\n\nThis work is outside of my primary SE role, but I look forward to finding or making a full time role that is in service of my mission statement.",
  "Experienced Senior Platform Engineer with a demonstrated history of working in the financial services industry. Manage a Slack org comprised of 7 different labels. Previous Slack Owner for a 60,000 person Slack Organization. Member of the Customer Advisory, Developer Advisory, and Certification Advisory Boards for Slack. Design enterprise chat bots for internal automations and processes.\n\nAvailable for independent consulting opportunities:\n• Enterprise Grid and Grid Design\n• Slack Integrations & Governance\n• Driving Value of Slack\n• Digital Collaboration\n• Organization Management\n• Interoperability and App Connections\n• Workflow Designs\n• Best Practices",
  "Hey there! I'm a software engineer with a solid foundation in JavaScript, Python and C++ with extensive knowledge with Object Oriented Programming and Algorithm Design and frameworks such as React.js. I have a desire to learn new things and challenge myself in new ways!\n\nOutside of coding, I have a logical mind and excellent mathematical and analytical skills, as well as a desire to create new ideas and innovate on past ones. My exposure to full stack development has also given me strong graphical design skills in terms of user experience and user interfaces. Finally, I'm a great communicator who isn't afraid to take charge and lead projects. I love collaborating with others to make visions a reality and achieve a common goal!",
  "I am a graduate of the University of Texas at Austin with a Bachelor of Science in Electrical and Computer Engineering and a Business Foundations Certificate. I currently work at Capital One as an iOS Tech Lead and Manager handling all things credit card payments.",
];
const profilePictures = [
  "https://th.bing.com/th/id/Rc67509cb8c9a44a2b5d9e6f683e65c79?rik=5g0H7j4TcGw3Rw&riu=http%3a%2f%2fimages.medicaldaily.com%2fsites%2fmedicaldaily.com%2ffiles%2f2013%2f08%2f04%2f0%2f62%2f6259.jpg&ehk=g2XIPgh9vAuduB7s32A7PzRZEh3%2foJiopOip4CBPUiw%3d&risl=&pid=ImgRaw",
  "https://th.bing.com/th/id/R0156731a4dcdc38a10e402791da8809d?rik=%2byJByh0vlfP1jg&riu=http%3a%2f%2f1.bp.blogspot.com%2f-Flgz-X52Sa8%2fT-xaP9vmUZI%2fAAAAAAAABBg%2fB8pL7lpfd8w%2fs1600%2fnewsitemoet.jpeg&ehk=Fnl7h0gfhN8xECjNsFXbF65jDH%2fBx%2bCIpP00uuWy4jc%3d&risl=&pid=ImgRaw",
  "https://th.bing.com/th/id/R5a0dd68fde47f73537a4adcb720a4e95?rik=g27mB8bOD4qBqg&riu=http%3a%2f%2f3.bp.blogspot.com%2f-hIZdzZipHGQ%2fT_xf8BYswyI%2fAAAAAAAAA1o%2ftrv7LbmwZw4%2fs1600%2fcat%2b17.jpg&ehk=7TmIXpvJ%2bL73BhlegqcNDwISry6D9aDnNK%2b%2fljmi4qw%3d&risl=&pid=ImgRaw",
  "https://th.bing.com/th/id/Rdb1b5bcb112ce24a483c8a37dcca2d99?rik=575VPy99pWieuA&riu=http%3a%2f%2fwww.reportingday.com%2fwp-content%2fuploads%2f2018%2f06%2fCat-Sleeping-Pics.jpg&ehk=29hRFj%2fA61wekwFW5uiZGVV%2fYNMgVXPkTKmUUp7tXoU%3d&risl=&pid=ImgRaw",
  "https://th.bing.com/th/id/R4e9bb4b2542e4b89896ed23c8f359a29?rik=q9b93pELQqy0UA&riu=http%3a%2f%2f2.bp.blogspot.com%2f--mqQKXiTD0E%2fUIURXCYUxUI%2fAAAAAAAAHuQ%2f8jMmIdkdLX8%2fs1600%2fcats_desktop_1920x1200_hd-wallpaper-817100.jpeg&ehk=ChJLIKi9uwB28d%2frF6%2bpwbm2la7jUqE10FNaNH8Vt%2bM%3d&risl=&pid=ImgRaw",
  "https://scitechdaily.com/images/Cat-COVID-19-Mask.jpg",
  "https://th.bing.com/th/id/OIP.jGtJjoPWvMHU_uQJ0l4J3wHaEK?pid=ImgDet&rs=1",
  "https://www.dailydot.com/wp-content/uploads/2018/10/olli-the-polite-cat.jpg",
  "https://th.bing.com/th/id/Rf2072c137f663bcba778f65105dd4c38?rik=p1VY6LQiabIKlw&riu=http%3a%2f%2fwww.kickvick.com%2fwp-content%2fuploads%2f2014%2f07%2ffunny-cats.jpg&ehk=EViCr9DhjR%2b5Vok5Nx%2bIyodEq%2f7JmsxJdWbmWubr9gw%3d&risl=&pid=ImgRaw",
  "https://www.hdwallpaper.nu/wp-content/uploads/2015/02/Funny-Cat-Hidden.jpg",
  "https://newevolutiondesigns.com/images/freebies/cat-wallpaper-38.jpg",
  "https://www.hdwallpaper.nu/wp-content/uploads/2015/02/funny_cat_face_pictures.jpg",
  "https://th.bing.com/th/id/OIP.vsRveDd4lvvau15ft-HdxAHaE8?pid=ImgDet&rs=1",
  "https://th.bing.com/th/id/R127ec59f2f984a3f18e49ca26c200937?rik=RZlx4XV3s3GSXg&riu=http%3a%2f%2f3.bp.blogspot.com%2f-B4BlhvwZrZQ%2fTZSbL7c0ZbI%2fAAAAAAAAAFE%2fSAxJge1rMd0%2fs1600%2fsad%2bcat%2b3.jpg&ehk=RUD1ukmWBJi3p70TJU86tfb5xZk2Ejz0Sd3eYasJ4TE%3d&risl=&pid=ImgRaw",
];
const githubProfiles = [
  "aaronPTB",
  "akruj17",
  "alioup",
  "alejuul",
  "bintay",
  "bmahajan",
  "bongani-m",
  "codesmary",
  "copperstick6",
  "davidzchen-ut",
  "iamzoh",
  "ian1780",
  "InfernalHydra",
  "jaflo",
  "jason-math",
  "Jennifer-Zheng",
  "jinyeom",
  "kaelens",
  "linhtoria",
  "michaelhankin",
  "nancytr",
  "nathan-chin-zz",
  "nihaody",
  "nikhil-ajjarapu",
  "nikhilajjarapu-zz",
  "pyrito",
  "rafferli",
  "raulcodes",
  "rjchee",
  "rohitdatta",
  "SanatSharma",
  "ShravanRavi2002",
  "shreyassood",
  "shry678",
  "Shwinn",
  "SShivang",
  "tadakda",
  "theCreedo",
  "ThomasGaubert",
  "yursky",
  "zanenasrallah",
];
const linkedinLinks = [null, "https://www.linkedin.com/in/kaelensayth/"];
const portfolioLinks = [null, "https://kaelensayth.me/"];

export function generateUsers(numberOfUsers) {
  return new Array(numberOfUsers).fill(0).map(generateUser);
}

export function generateUser() {
  return {
    name: getRandomElement(names),
    school: getRandomElement(schools),
    major: getRandomElement(majors),
    classStanding: getRandomElement(classStandings),
    skills: getRandomElements(skills, Math.floor(Math.random() * 5)),
    experienceLevel: getRandomElement(experienceLevels),
    intro: getRandomElement(intros),
    profilePictureUrl: getRandomElement(profilePictures),
    github: getRandomElement(githubProfiles),
    linkedin: getRandomElement(linkedinLinks),
    portfolio: getRandomElement(portfolioLinks),
  };
}
