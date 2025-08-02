"use client";
import { useState, useEffect } from "react";
import {
  Code,
  Zap,
  Users,
  TrendingUp,
  Play,
  Clock,
  Star,
  Activity,
  Terminal,
  Folder,
  BookOpen,
  Award,
  ChevronRight,
  Globe,
  Coffee,
  Cpu,
  Database,
  Sparkles
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Project, User } from "@/src/types";
import Image from "next/image";

async function userProjectsFetch(): Promise<Project[]> {
  try {
    const response = await axios.get('/api/user-projects');
    return response.data as Project[];
  } catch (e) {
    console.error(e);
    throw new Error("Could not fetch user projects")
  }
}

async function userDetailsFetch(): Promise<User> {
  try {
    const response = await axios.get('/api/user-data');

    return response.data as User;
  } catch (e) {
    console.error(e);
    throw new Error("Could not fetch user Details")
  }
}

export default function HomePage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    linesOfCode: 0,
    activeProjects: 0,
    collaborators: 0
  });

  const [recentProjects, setRecentProjects] = useState<Project[] | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const { status } = useSession();
  const router = useRouter();
  const [quickActions] = useState([
    { title: "Create React App", desc: "Modern React with TypeScript", icon: Code, color: "from-blue-500 to-cyan-500" },
    { title: "Node.js API", desc: "RESTful API with Express", icon: Database, color: "from-green-500 to-emerald-500" },
    { title: "Python ML", desc: "Machine learning workspace", icon: Cpu, color: "from-purple-500 to-pink-500" },
    { title: "Next.js Full Stack", desc: "Full-stack application", icon: Globe, color: "from-orange-500 to-red-500" }
  ]);
  const [achievements] = useState([
    { title: "Code Ninja", desc: "100+ projects created", icon: Award, unlocked: true },
    { title: "Speed Demon", desc: "Deploy in under 30s", icon: Zap, unlocked: true },
    { title: "Team Player", desc: "5+ collaborations", icon: Users, unlocked: false },
    { title: "Marathon Coder", desc: "24hr coding streak", icon: Coffee, unlocked: false }
  ]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }

  }, [status, router]);

  // Animate stats on load
  useEffect(() => {
    const animateStats = () => {
      const targets = {
        totalProjects: userDetails?.projects.length ?? 0,
        linesOfCode: 125847,
        activeProjects: userDetails?.projects.length ?? 0,
        collaborators: 8
      }
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;

      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setStats({
          totalProjects: Math.floor(targets.totalProjects * easeOut),
          linesOfCode: Math.floor(targets.linesOfCode * easeOut),
          activeProjects: Math.floor(targets.activeProjects * easeOut),
          collaborators: Math.floor(targets.collaborators * easeOut)
        });

        if (step >= steps) {
          clearInterval(interval);
          setStats(targets);
        }
      }, stepTime);
    };

    animateStats();
  }, [userDetails]);

  //fetches user details
  useEffect(() => {
    userDetailsFetch()
      .then(setUserDetails)
      .catch(err => console.error(err));
  }, [])

  // fetches user projects details 
  useEffect(() => {
    userProjectsFetch()
      .then(setRecentProjects)
      .catch(err => console.error(err));
  }, []);

  // Loading Skeleton
  if (status == "loading") return <div className="p-8 min-h-screen bg-gray-950 w-[82vw]">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-800/50 rounded w-48 mb-6"></div>
      <div className="h-20 bg-gray-800/50 rounded mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-800/50 rounded-lg border border-gray-800/50"></div>
        ))}
      </div>
    </div>
  </div>

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'building': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'deployed': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getLanguageColor = (lang: string) => {
    const colors = {
      'React': 'text-blue-400 bg-blue-400/20 border-blue-400/30',
      'Python': 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30',
      'Node.js': 'text-green-400 bg-green-400/20 border-green-400/30',
      'TypeScript': 'text-blue-400 bg-blue-400/20 border-blue-400/30',
      "Github Imported": 'text-blue-400 bg-blue-400/20 border-blue-400/30'
    };
    return colors[lang as keyof typeof colors] || 'text-gray-400 bg-gray-400/20 border-gray-400/30';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pl-2">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-green-900/10 pointer-events-none"></div>

      <div className="relative z-10 p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                  Welcome back, {userDetails?.name}!
                </span>
              </h1>
              <p className="text-gray-400 font-mono text-lg">
                Ready to build something amazing today?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-400 font-mono">Current Time</div>
                <div className="text-lg font-semibold text-blue-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {/* <TimeComponent/> */}
              <div className="w-10 h-10">
                {userDetails?.image == null ?
                  <Terminal className="w-6 h-6 text-white" /> : (
                    <Image
                      src={userDetails.image}
                      alt={userDetails.name || "User Avatar"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover w-12 h-10"
                    />
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6 hover:border-blue-500/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-mono">total_projects</p>
              <p className="text-3xl font-bold text-blue-400">{stats.totalProjects}</p>
            </div>
            <Folder className="w-8 h-8 text-blue-500/50" />
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6 hover:border-purple-500/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-mono">lines_of_code</p>
              <p className="text-3xl font-bold text-purple-400">{stats.linesOfCode.toLocaleString()}</p>
            </div>
            <Code className="w-8 h-8 text-purple-500/50" />
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6 hover:border-green-500/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-mono">active_projects</p>
              <p className="text-3xl font-bold text-green-400">{stats.activeProjects}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500/50" />
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6 hover:border-yellow-500/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-mono">collaborators</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.collaborators}</p>
            </div>
            <Users className="w-8 h-8 text-yellow-500/50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Quick Start
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={index}
                    className="group relative overflow-hidden bg-gray-800/50 hover:bg-gray-800/70 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-400">{action.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2 group-hover:text-gray-300" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Recent Projects
              </h2>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-mono">
                view_all →
              </button>
            </div>
            {recentProjects && recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map((project, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <div>
                        <h3 className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                          {project.projectName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`px-2 py-1 rounded-md text-xs border ${getLanguageColor(project.language == "" ? "Github Imported" : project.language)}`}>
                            {project.language == "" ? "Github Project" : project.language}
                          </span>
                          <span className="text-gray-400">{String(project.lastModified)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-md text-xs border ${getStatusColor("building")}`}>
                        building
                      </span>
                      <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                No recent projects found
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Achievements */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Achievements
            </h2>
            <div className="space-y-3">
              {achievements.map((achievement, index) => {
                const IconComponent = achievement.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${achievement.unlocked
                      ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-300'
                      : 'bg-gray-800/30 border-gray-700/30 text-gray-500'
                      }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold text-sm">{achievement.title}</h3>
                      <p className="text-xs opacity-75">{achievement.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              System Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Build System</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Deployment</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Database</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-yellow-400">Maintenance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Pro Tip
            </h2>
            <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4">
              <p className="text-sm text-blue-300 font-mono">
                  // Use Ctrl+Shift+P to open command palette
                <br />
                  // Try "Deploy to production" for instant deployment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}