const path = require('path');
try { require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); } catch (_) {}
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Video = require('./models/Video');
const Comment = require('./models/Comment');

const demoVideos = [
  { url: 'https://res.cloudinary.com/demo/video/upload/v1689864557/samples/sea-turtle.mp4', pid: 'samples/sea-turtle', thumb: 'https://res.cloudinary.com/demo/video/upload/so_0,w_640,h_360,c_fill/samples/sea-turtle.jpg' },
  { url: 'https://res.cloudinary.com/demo/video/upload/v1689864557/samples/elephants.mp4', pid: 'samples/elephants', thumb: 'https://res.cloudinary.com/demo/video/upload/so_2,w_640,h_360,c_fill/samples/elephants.jpg' },
  { url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4', pid: 'samples/dog', thumb: 'https://picsum.photos/seed/yt3/640/360' },
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding...');

    await Comment.deleteMany({});
    await Video.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data.');

    const users = [];
    const userData = [
      { username: 'TechChannel', email: 'tech@demo.com', password: 'demo123', avatar: 'https://ui-avatars.com/api/?name=Tech+Channel&background=e53935&color=fff&size=128&bold=true', channelName: 'Tech World', description: 'Cutting-edge programming tutorials, tech news, and developer tools. Building the future one line at a time.' },
      { username: 'GamingPro', email: 'gaming@demo.com', password: 'demo123', avatar: 'https://ui-avatars.com/api/?name=Gaming+Pro&background=8e24aa&color=fff&size=128&bold=true', channelName: 'Gaming Universe', description: 'Epic gameplay, honest reviews, and pro strategies across all major titles.' },
      { username: 'MusicVibes', email: 'music@demo.com', password: 'demo123', avatar: 'https://ui-avatars.com/api/?name=Music+Vibes&background=1e88e5&color=fff&size=128&bold=true', channelName: 'Music Vibes', description: 'Chill beats, lo-fi sessions, and curated playlists to help you focus and relax.' },
    ];

    for (const u of userData) {
      const user = new User(u);
      await user.save();
      users.push(user);
    }
    users[0].subscribers.push(users[1]._id, users[2]._id);
    users[1].subscribers.push(users[0]._id);
    users[2].subscribers.push(users[0]._id, users[1]._id);
    await Promise.all(users.map(u => u.save()));
    console.log(`Created ${users.length} users.`);

    const now = Date.now();
    const DAY = 86400000;
    const videoData = [
      { title: 'Building a Full-Stack App with MERN in 2024', description: 'Complete guide to building a production-ready MERN stack application from scratch.', uploader: users[0]._id, tags: ['mern', 'fullstack', 'react', 'nodejs'], category: 'Tech', views: 48200, duration: 5420, createdAt: new Date(now - 2 * DAY) },
      { title: 'React 19 — Every New Feature Explained', description: 'Deep dive into React 19 features: Server Components, Actions, and more.', uploader: users[0]._id, tags: ['react', 'javascript', 'frontend'], category: 'Tech', views: 31500, duration: 1845, createdAt: new Date(now - 5 * DAY) },
      { title: 'Top 10 VS Code Extensions for 2024', description: 'Boost your productivity with these essential extensions.', uploader: users[0]._id, tags: ['vscode', 'productivity', 'tools'], category: 'Tech', views: 22800, duration: 720, createdAt: new Date(now - 8 * DAY) },
      { title: 'CSS Grid & Flexbox Masterclass', description: 'Stop guessing CSS layouts. Learn Grid and Flexbox the right way.', uploader: users[0]._id, tags: ['css', 'flexbox', 'grid', 'webdev'], category: 'Tech', views: 15400, duration: 2340, createdAt: new Date(now - 12 * DAY) },
      { title: 'Epic Gaming Montage — Best Clutches 2024', description: 'The most insane gaming moments compiled into one video.', uploader: users[1]._id, tags: ['gaming', 'montage', 'highlights'], category: 'Gaming', views: 89600, duration: 480, createdAt: new Date(now - 1 * DAY) },
      { title: 'Minecraft 100 Days Hardcore Survival', description: 'Can I survive 100 days in Minecraft Hardcore? Watch and find out!', uploader: users[1]._id, tags: ['minecraft', 'survival', 'challenge'], category: 'Gaming', views: 156000, duration: 3600, createdAt: new Date(now - 4 * DAY) },
      { title: 'GTA 6 — Everything Confirmed So Far', description: 'Comprehensive breakdown of all GTA 6 details, leaks, and trailers.', uploader: users[1]._id, tags: ['gta6', 'rockstar', 'news'], category: 'Gaming', views: 245000, duration: 960, createdAt: new Date(now - 7 * DAY) },
      { title: 'Cyberpunk 2077 — Is It Worth Playing Now?', description: 'Revisiting Cyberpunk after all the patches and DLC.', uploader: users[1]._id, tags: ['cyberpunk', 'review', 'rpg'], category: 'Gaming', views: 67400, duration: 1200, createdAt: new Date(now - 15 * DAY) },
      { title: 'Lofi Hip Hop — Study & Chill Beats', description: '3 hours of relaxing lo-fi beats perfect for studying and focus.', uploader: users[2]._id, tags: ['lofi', 'chill', 'study', 'beats'], category: 'Music', views: 412000, duration: 10800, createdAt: new Date(now - 3 * DAY) },
      { title: 'Guitar Tutorial — Learn 5 Songs in 30 Minutes', description: 'Beginner-friendly guitar lesson covering 5 popular songs.', uploader: users[2]._id, tags: ['guitar', 'tutorial', 'beginner'], category: 'Music', views: 34200, duration: 1800, createdAt: new Date(now - 9 * DAY) },
      { title: 'Day in My Life as a Developer — Tokyo Vlog', description: 'Follow me around Tokyo as I balance coding and exploring.', uploader: users[0]._id, tags: ['vlog', 'developer', 'tokyo', 'travel'], category: 'Vlog', views: 78500, duration: 900, createdAt: new Date(now - 6 * DAY) },
      { title: 'Synthwave Playlist — Retro Vibes 2024', description: 'The ultimate synthwave and retrowave playlist for your night drives.', uploader: users[2]._id, tags: ['synthwave', 'retro', 'playlist', 'electronic'], category: 'Music', views: 198000, duration: 7200, createdAt: new Date(now - 11 * DAY) },
    ];

    const videos = [];
    for (let i = 0; i < videoData.length; i++) {
      const demo = demoVideos[i % demoVideos.length];
      videos.push({
        ...videoData[i],
        videoUrl: demo.url,
        publicId: demo.pid,
        thumbnailUrl: demo.thumb,
        likes: i % 3 === 0 ? [users[1]._id, users[2]._id] : i % 3 === 1 ? [users[0]._id] : [],
      });
    }
    const createdVideos = await Video.insertMany(videos);
    console.log(`Created ${createdVideos.length} videos.`);

    const commentTexts = [
      'This is absolutely amazing! Learned so much.', 'Can you make a part 2?',
      'Best tutorial I\'ve seen on this topic!', 'The editing is on point 🔥',
      'Subscribed instantly after watching this.', 'This helped me land my first job, thank you!',
      'I watch this every morning to get motivated.', 'Incredible quality as always.',
      'The soundtrack is perfect 🎵', 'Just wow. Pure quality content.',
      'I\'ve rewatched this 3 times already.', 'You deserve way more views!',
      'This channel is criminally underrated.', 'Perfect background music for coding.',
      'The combo at 3:45 was insane!', 'Finally someone explains this clearly.',
      'My new favorite channel.', 'Been waiting for this video!',
      'The production value is next level.', 'Thanks for the inspiration!',
    ];
    const comments = [];
    for (let i = 0; i < 20; i++) {
      comments.push({
        text: commentTexts[i],
        author: users[i % 3]._id,
        video: createdVideos[i % createdVideos.length]._id,
        createdAt: new Date(now - Math.random() * 15 * DAY),
      });
    }
    await Comment.insertMany(comments);
    console.log(`Created ${comments.length} comments.`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo credentials (password: demo123):');
    console.log('  tech@demo.com    (Tech World)');
    console.log('  gaming@demo.com  (Gaming Universe)');
    console.log('  music@demo.com   (Music Vibes)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
