import { Plus, Calendar, Code, User, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { projectName } from "@/store/atoms/projectName";
import { userSessionAtom } from "@/store/atoms/userId";

type Project = {
  name: string;
  username?: string;
  language?: string;
  createdAt?: string;
  lastModified?: string;
};

export const ProjectCard = ({ name, username, language, createdAt, lastModified, viewMode }: Project & { viewMode: 'grid' | 'list' }) => {

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const router = useRouter();
  const [, setProjectName] = useAtom(projectName);
  const [userEmail] = useAtom(userSessionAtom);

  const handleClick = () => {
    setProjectName(name);
    if (userEmail) {
      router.push(`/project/${userEmail}/${name}`);
    } else {
      console.warn("User email is not available yet");
    }
  };

  const getLanguageColor = (lang?: string) => {
    const colors = {
      'React': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Vue': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Next.js': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'Node.js': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'Python': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'TypeScript': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    };
    return colors[lang as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-4 hover:bg-gray-800/40 hover:border-gray-700/50 transition-all duration-200 group" onClick={handleClick} >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">{name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              {username && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-300">{username}</span>
                </span>
              )}
              {language && (
                <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs ${getLanguageColor(language)}`}>
                  <Code className="w-3 h-3" />
                  {language}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-400">{formatDate(createdAt)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-400">{formatDate(lastModified)}</span>
              </span>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 rounded-md transition-all duration-200 border border-blue-600/30 hover:border-blue-500/50">
            Open
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50  p-6 hover:bg-gray-800/40 hover:border-gray-700/50 transition-all duration-200 group"
      onClick={handleClick}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-gray-100 text-lg group-hover:text-white transition-colors">{name}</h3>
        <button className="text-blue-400 hover:bg-blue-600/20 rounded-md p-2 transition-all duration-200 hover:text-blue-300 border border-transparent hover:border-blue-600/30">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {username && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-300">{username}</span>
          </div>
        )}
        {language && (
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-gray-500" />
            <span className={`px-2 py-1 rounded-md border text-xs ${getLanguageColor(language)}`}>
              {language}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-gray-400">Created {formatDate(createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-gray-400">Modified {formatDate(lastModified)}</span>
        </div>
      </div>
    </div>
  );
};