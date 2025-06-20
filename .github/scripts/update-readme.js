const fs = require('fs');
const axios = require('axios');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const username = process.env.GITHUB_USERNAME || 'afzalimdad9';

// Enhanced content arrays
const jokes = [
  "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
  "Why don't programmers like nature? It has too many bugs! 🌿",
  "A SQL query goes into a bar, walks up to two tables and asks: 'Can I join you?' 🍺",
  "Why do Java developers wear glasses? Because they can't C# ! 👓",
  "There are only 10 types of people in the world: those who understand binary and those who don't. 01100010",
  "Programming is like sex: One mistake and you have to support it for the rest of your life. 😅",
  "99 little bugs in the code, 99 little bugs. Take one down, patch it around, 117 little bugs in the code! 🎵",
  "Why did the programmer quit his job? Because he didn't get arrays! 📊",
  "What's the object-oriented way to become wealthy? Inheritance! 💰"
];

const activities = [
  "🚀 Try building a new side project with a technology you've never used before",
  "📚 Read about a new programming paradigm or design pattern",
  "🎯 Solve a challenging algorithm problem on LeetCode or HackerRank",
  "🔧 Refactor some old code to make it cleaner and more efficient",
  "🌟 Contribute to an open source project that interests you",
  "📝 Write a technical blog post about something you recently learned",
  "🎨 Design and implement a beautiful UI component from scratch",
  "🤝 Pair program with a colleague or friend on an interesting problem",
  "🧪 Write comprehensive tests for a project you've been neglecting",
  "📱 Build a mobile app version of one of your web projects",
  "🔍 Research and implement a new optimization technique",
  "🎮 Create a simple game to practice your programming skills",
  "📊 Build a data visualization for an interesting dataset",
  "🛠️ Set up CI/CD pipeline for one of your projects"
];

const quotes = [
  "\"Code is like humor. When you have to explain it, it's bad.\" - Cory House",
  "\"First, solve the problem. Then, write the code.\" - John Johnson",
  "\"Any fool can write code that a computer can understand. Good programmers write code that humans can understand.\" - Martin Fowler",
  "\"The best error message is the one that never shows up.\" - Thomas Fuchs",
  "\"Programming isn't about what you know; it's about what you can figure out.\" - Chris Pine",
  "\"Code never lies, comments sometimes do.\" - Ron Jeffries",
  "\"Simplicity is the ultimate sophistication.\" - Leonardo da Vinci",
  "\"Make it work, make it right, make it fast.\" - Kent Beck",
  "\"Clean code always looks like it was written by someone who cares.\" - Michael Feathers",
  "\"Programs must be written for people to read, and only incidentally for machines to execute.\" - Harold Abelson"
];

// Language to skill icon mapping
const languageToIcon = {
  'JavaScript': 'js',
  'TypeScript': 'ts',
  'Python': 'python',
  'Java': 'java',
  'C++': 'cpp',
  'C': 'c',
  'HTML': 'html',
  'CSS': 'css',
  'React': 'react',
  'Vue': 'vue',
  'Angular': 'angular',
  'Node.js': 'nodejs',
  'Express': 'express',
  'Django': 'django',
  'Flask': 'flask',
  'MongoDB': 'mongodb',
  'PostgreSQL': 'postgresql',
  'MySQL': 'mysql',
  'Docker': 'docker',
  'AWS': 'aws',
  'Git': 'git',
  'Linux': 'linux',
  'Rust': 'rust',
  'Go': 'golang',
  'PHP': 'php',
  'Ruby': 'ruby',
  'Swift': 'swift',
  'Kotlin': 'kotlin',
  'Flutter': 'flutter',
  'React Native': 'react'
};

async function getRecentRepositories() {
  try {
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      sort: 'updated',
      per_page: 10,
    });

    return repos.filter(repo => !repo.fork).slice(0, 5);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
  }
}

async function getRecentCommits() {
  try {
    const { data: events } = await octokit.rest.activity.listPublicEventsForUser({
      username,
      per_page: 100,
    });

    const pushEvents = events
      .filter(event => event.type === 'PushEvent')
      .slice(0, 10);

    return pushEvents;
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
}

async function getLanguageStats() {
  try {
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      per_page: 100,
    });

    const languages = {};
    
    for (const repo of repos.filter(r => !r.fork)) {
      try {
        const { data: langData } = await octokit.rest.repos.listLanguages({
          owner: username,
          repo: repo.name,
        });

        Object.entries(langData).forEach(([lang, bytes]) => {
          languages[lang] = (languages[lang] || 0) + bytes;
        });
      } catch (error) {
        // Skip repos with language data errors
        continue;
      }
    }

    return Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  } catch (error) {
    console.error('Error fetching language stats:', error);
    return [];
  }
}

async function getWeather() {
  try {
    if (!process.env.OPENWEATHER_API_KEY) {
      return "🌤️ Weather API key not configured";
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=Karachi,PK&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    const weather = response.data;
    const temp = Math.round(weather.main.temp);
    const description = weather.weather[0].description;
    const icon = weather.weather[0].icon;
    
    return `🌡️ ${temp}°C, ${description} in Karachi 🇵🇰`;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return "🌤️ Weather data unavailable";
  }
}

async function updateReadme() {
  try {
    let readme = fs.readFileSync('README.md', 'utf8');
    
    // Get dynamic data
    const repos = await getRecentRepositories();
    const commits = await getRecentCommits();
    const languages = await getLanguageStats();
    const weather = await getWeather();

    // Update current projects based on recent repos
    let currentProjects = "<!-- CURRENT_PROJECTS:START -->\n";
    if (repos.length > 0) {
      const mainProject = repos[0];
      currentProjects += `- 🔭 I'm currently working on [${mainProject.name}](${mainProject.html_url})`;
      if (mainProject.description) {
        currentProjects += ` - ${mainProject.description}`;
      }
      currentProjects += '\n';
      
      // Add learning section based on languages
      if (languages.length > 0) {
        const topLanguages = languages.slice(0, 3).map(([lang]) => lang);
        currentProjects += `- 🌱 I'm currently working with **${topLanguages.join(', ')}**\n`;
      }
      
      // Add collaboration suggestion
      if (repos.length > 1) {
        const collabRepo = repos[1];
        currentProjects += `- 👯 I'm looking to collaborate on [${collabRepo.name}](${collabRepo.html_url})\n`;
      }
    }
    currentProjects += "<!-- CURRENT_PROJECTS:END -->";

    // Update recent activity
    let recentActivity = "<!-- RECENT_ACTIVITY:START -->\n";
    if (commits.length > 0) {
      commits.slice(0, 5).forEach(event => {
        const repo = event.repo.name.replace(`${username}/`, '');
        const commitCount = event.payload.commits?.length || 1;
        const date = new Date(event.created_at).toLocaleDateString();
        recentActivity += `- 📝 ${commitCount} commit${commitCount > 1 ? 's' : ''} to **${repo}** on ${date}\n`;
      });
    } else {
      recentActivity += "- 🔄 Loading recent activity...\n";
    }
    recentActivity += "<!-- RECENT_ACTIVITY:END -->";

    // Update hot repositories
    let hotRepos = "<!-- HOT_REPOS:START -->\n";
    repos.slice(0, 3).forEach(repo => {
      const updatedDate = new Date(repo.updated_at).toLocaleDateString();
      hotRepos += `- 🔥 [${repo.name}](${repo.html_url}) - ${repo.description || 'No description'} ⭐ ${repo.stargazers_count} (Updated: ${updatedDate})\n`;
    });
    hotRepos += "<!-- HOT_REPOS:END -->";

    // Update dynamic tech stack
    let techStack = "<!-- DYNAMIC_TECH_STACK:START -->\n";
    if (languages.length > 0) {
      const totalBytes = languages.reduce((sum, [, bytes]) => sum + bytes, 0);
      techStack += "**Most Used Languages This Month:**\n\n";
      languages.forEach(([lang, bytes]) => {
        const percentage = ((bytes / totalBytes) * 100).toFixed(1);
        const progressBar = '█'.repeat(Math.round(percentage / 5)) + '░'.repeat(20 - Math.round(percentage / 5));
        techStack += `${lang}: ${percentage}% ${progressBar}\n\n`;
      });
    }
    techStack += "<!-- DYNAMIC_TECH_STACK:END -->";

    // Update skill icons based on recent languages
    let skillIcons = "<!-- SKILL_ICONS:START -->\n<p align=\"center\">\n";
    if (languages.length > 0) {
      const icons = languages
        .map(([lang]) => languageToIcon[lang])
        .filter(Boolean)
        .slice(0, 20)
        .join(',');
      
      if (icons) {
        skillIcons += `  <img src="https://skillicons.dev/icons?i=${icons}" alt="Current Tech Stack" />\n`;
      }
    }
    skillIcons += "</p>\n<!-- SKILL_ICONS:END -->";

    // Update typing animation lines
    const typingLines = [
      "Full+Stack+Developer",
      "Game+Development+Enthusiast",
      "AI+%26+ML+Explorer",
      "Open+Source+Contributor"
    ];
    
    if (languages.length > 0) {
      typingLines.push(`${languages[0][0]}+Developer`);
    }

    // Update weekly stats
    let weeklyStats = "<!-- WEEKLY_STATS:START -->\n";
    const totalCommits = commits.length;
    const uniqueRepos = new Set(commits.map(c => c.repo.name)).size;
    weeklyStats += `- 📊 **${totalCommits}** commits across **${uniqueRepos}** repositories\n`;
    weeklyStats += `- 🎯 **${repos.length}** active projects\n`;
    weeklyStats += `- 💻 **${languages.length}** programming languages used\n`;
    weeklyStats += "<!-- WEEKLY_STATS:END -->";

    // Update GitHub analytics
    let githubAnalytics = "<!-- GITHUB_ANALYTICS:START -->\n";
    githubAnalytics += `- 🏆 **${repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}** total stars earned\n`;
    githubAnalytics += `- 🍴 **${repos.reduce((sum, repo) => sum + repo.forks_count, 0)}** total forks\n`;
    githubAnalytics += `- 📂 **${repos.length}** public repositories\n`;
    githubAnalytics += "<!-- GITHUB_ANALYTICS:END -->";

    // Apply all updates
    const updates = [
      { pattern: /<!-- CURRENT_PROJECTS:START -->[\s\S]*?<!-- CURRENT_PROJECTS:END -->/, replacement: currentProjects },
      { pattern: /<!-- RECENT_ACTIVITY:START -->[\s\S]*?<!-- RECENT_ACTIVITY:END -->/, replacement: recentActivity },
      { pattern: /<!-- HOT_REPOS:START -->[\s\S]*?<!-- HOT_REPOS:END -->/, replacement: hotRepos },
      { pattern: /<!-- DYNAMIC_TECH_STACK:START -->[\s\S]*?<!-- DYNAMIC_TECH_STACK:END -->/, replacement: techStack },
      { pattern: /<!-- SKILL_ICONS:START -->[\s\S]*?<!-- SKILL_ICONS:END -->/, replacement: skillIcons },
      { pattern: /<!-- WEEKLY_STATS:START -->[\s\S]*?<!-- WEEKLY_STATS:END -->/, replacement: weeklyStats },
      { pattern: /<!-- GITHUB_ANALYTICS:START -->[\s\S]*?<!-- GITHUB_ANALYTICS:END -->/, replacement: githubAnalytics },
      { pattern: /<!-- TYPING_LINES:START -->[\s\S]*?<!-- TYPING_LINES:END -->/, replacement: typingLines.join(';') },
      { pattern: /<!-- JOKE:START -->[\s\S]*?<!-- JOKE:END -->/, replacement: `<!-- JOKE:START -->\n${jokes[Math.floor(Math.random() * jokes.length)]}\n<!-- JOKE:END -->` },
      { pattern: /<!-- ACTIVITY:START -->[\s\S]*?<!-- ACTIVITY:END -->/, replacement: `<!-- ACTIVITY:START -->\n${activities[Math.floor(Math.random() * activities.length)]}\n<!-- ACTIVITY:END -->` },
      { pattern: /<!-- QUOTE:START -->[\s\S]*?<!-- QUOTE:END -->/, replacement: `<!-- QUOTE:START -->\n${quotes[Math.floor(Math.random() * quotes.length)]}\n<!-- QUOTE:END -->` },
      { pattern: /<!-- WEATHER:START -->[\s\S]*?<!-- WEATHER:END -->/, replacement: `<!-- WEATHER:START -->\n${weather}\n<!-- WEATHER:END -->` },
      { pattern: /<!-- TIMESTAMP:START -->[\s\S]*?<!-- TIMESTAMP:END -->/, replacement: `<!-- TIMESTAMP:START -->${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}<!-- TIMESTAMP:END -->` }
    ];

    updates.forEach(({ pattern, replacement }) => {
      readme = readme.replace(pattern, replacement);
    });
    
    fs.writeFileSync('README.md', readme);
    console.log('✅ README updated successfully with dynamic content!');
  } catch (error) {
    console.error('❌ Error updating README:', error);
    process.exit(1);
  }
}

updateReadme();