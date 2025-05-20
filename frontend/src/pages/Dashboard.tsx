import { motion } from 'framer-motion';
import { BookOpen, Download, FileText, Sparkles, Zap, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { courseApi } from '../services/api';
import { toast } from 'react-hot-toast';

interface GeneratedCourse {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  format: 'txt' | 'pdf';
}

const Dashboard = () => {
  const [coursePrompt, setCoursePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [isApiHealthy, setIsApiHealthy] = useState<boolean | null>(null);

  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        // First try to make a simple HEAD request to the API root
        const response = await fetch('/api', { method: 'HEAD' });
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        // If HEAD request succeeds, try to fetch courses
        const coursesResponse = await courseApi.getCourses();
        console.log('API Health Check - Courses Response:', coursesResponse);
        
        if (coursesResponse.success) {
          setIsApiHealthy(true);
          toast.success('Connected to API server');
        } else {
          throw new Error(coursesResponse.error || 'Failed to fetch courses');
        }
      } catch (error) {
        console.error('API Health Check Failed:', error);
        setIsApiHealthy(false);
        
        // More specific error messages based on error type
        if (error instanceof TypeError) {
          if (error.message.includes('Failed to fetch')) {
            toast.error('Failed to connect to the API server. Is it running?');
          } else {
            toast.error('Network error. Please check your connection.');
          }
        } else {
          toast.error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    };

    checkApiHealth();
    
    // Set up periodic health check every 30 seconds
    const healthCheckInterval = setInterval(checkApiHealth, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(healthCheckInterval);
  }, []);

  const handleDownload = async (format: 'pdf' | 'txt' = 'txt') => {
    if (!generatedCourse) return;
    
    try {
      // Use the API to download the file in the specified format
      await courseApi.downloadFile(
        generatedCourse.id,
        `course-${generatedCourse.id}`,
        format
      );
      
      toast.success(`Downloading as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file. Please try again.');
      
      // Fallback to client-side download if API fails
      try {
        const content = generatedCourse.content;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `course-${generatedCourse.id}.${format}`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
        toast.success('Downloaded as fallback');
      } catch (fallbackError) {
        console.error('Fallback download failed:', fallbackError);
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coursePrompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedCourse(null);
    
    try {
      // Call the actual API to generate the course
      const response = await courseApi.generateCourse(coursePrompt, 'txt');
      
      if (response.success && response.data) {
        // Fetch the generated course content
        const contentResponse = await fetch(response.data.fileUrl);
        const content = await contentResponse.text();
        
        const newCourse: GeneratedCourse = {
          id: response.data.fileId,
          title: coursePrompt,
          content: content,
          createdAt: new Date().toISOString(),
          format: 'txt',
        };
        
        setGeneratedCourse(newCourse);
        toast.success('Course generated successfully!');
      } else {
        throw new Error(response.error || 'Failed to generate course');
      }
      
    } catch (error) {
      console.error('Error generating course:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate course. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7357F6]/10 via-[#3EC6FF]/10 to-[#8A63F2]/10" />
        
        {/* Floating UI Elements */}
        <motion.div 
          className="absolute top-1/4 left-[10%] w-48 h-32 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl p-4"
          initial={{ y: 0, rotate: -5 }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="h-2 w-8 bg-[#7357F6]/30 rounded-full mb-2"></div>
          <div className="h-2 w-16 bg-[#3EC6FF]/30 rounded-full mb-2"></div>
          <div className="h-2 w-12 bg-[#7357F6]/30 rounded-full"></div>
        </motion.div>

        <motion.div 
          className="absolute top-1/3 right-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-[#7357F6] to-[#3EC6FF] flex items-center justify-center shadow-lg"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Zap className="w-6 h-6 text-white" fill="currentColor" />
        </motion.div>

        {/* Sparkles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#FFD76D] rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px 2px #FFD76D',
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16 lg:py-20 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7357F6] to-[#3EC6FF] mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Create Your Course
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Transform your ideas into structured learning with AI-powered course generation
          </motion.p>
        </div>

        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={coursePrompt}
                onChange={(e) => setCoursePrompt(e.target.value)}
                className="block w-full pl-10 pr-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7357F6] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="Enter a topic (e.g., Introduction to Machine Learning)"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="submit"
                  disabled={isGenerating || !coursePrompt.trim()}
                  className={`inline-flex items-center px-6 py-2.5 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105 ${
                    isGenerating || !coursePrompt.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#7357F6] to-[#3EC6FF] hover:shadow-lg hover:shadow-[#7357F6]/30'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Describe what you want to learn or teach in detail for better results
            </p>
          </form>

          {/* Output Section */}
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7357F6] to-[#3EC6FF]">
                  Your Course
                </span>
              </h2>
              {generatedCourse && (
                <div className="flex space-x-3 mt-3 sm:mt-0">
                  <button
                    onClick={() => handleDownload('pdf')}
                    disabled={isGenerating}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7357F6] transition-colors duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleDownload('txt')}
                    disabled={isGenerating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#7357F6] hover:bg-[#5e45d8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5e45d8] transition-colors duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    TXT
                  </button>
                </div>
              )}
            </div>
            
            {isGenerating ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border-2 border-dashed border-gray-200">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#7357F6] to-[#3EC6FF] opacity-20 animate-ping absolute inset-0"></div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#7357F6] to-[#3EC6FF] flex items-center justify-center relative">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Crafting your course</h3>
                  <p className="text-gray-500 text-center max-w-md">Our AI is generating high-quality content for your course. This may take a moment...</p>
                  <div className="mt-6 w-full max-w-xs bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#7357F6] to-[#3EC6FF] h-full rounded-full animate-pulse" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-md">
                {isApiHealthy === false ? (
                  <div className="text-center py-8 px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Connection Error</h3>
                    <p className="text-gray-500 mb-4">Unable to connect to the server. Please check your connection.</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="px-4 py-2 text-sm font-medium text-white bg-[#7357F6] hover:bg-[#5e45d8] rounded-lg transition-colors duration-200"
                    >
                      Try Again
                    </button>
                  </div>
                ) : generatedCourse ? (
                  <div className="prose max-w-none">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                      {generatedCourse.title}
                    </h2>
                    <div 
                      className="text-gray-700 whitespace-pre-line leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{ 
                        __html: generatedCourse.content
                          .split('\n')
                          .filter(para => para.trim() !== '')
                          .map(para => {
                            if (para.startsWith('## ')) {
                              return `<h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">${para.substring(3)}</h3>`;
                            } else if (para.startsWith('### ')) {
                              return `<h4 class="text-lg font-medium text-gray-700 mt-6 mb-2">${para.substring(4)}</h4>`;
                            } else if (para.startsWith('- ')) {
                              return `<ul class="list-disc pl-5 space-y-1"><li>${para.substring(2)}</li></ul>`;
                            } else {
                              return `<p class="text-gray-700 leading-relaxed">${para}</p>`;
                            }
                          })
                          .join('')
                      }} 
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-4">
                      <FileText className="h-10 w-10 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">Your course will appear here</h3>
                    <p className="mt-1 text-gray-500">Enter a topic above to generate your course content</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => handleDownload('pdf')}
                disabled={isGenerating || !generatedCourse}
                className={`flex items-center justify-center px-6 py-3 rounded-lg border ${
                  isGenerating || !generatedCourse
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                } font-medium transition-colors duration-200`}
              >
                <Download className="w-5 h-5 mr-2" />
                Download as PDF
              </button>
              <button
                onClick={() => handleDownload('txt')}
                disabled={isGenerating || !generatedCourse}
                className={`flex items-center justify-center px-6 py-3 rounded-lg border ${
                  isGenerating || !generatedCourse
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                } font-medium transition-colors duration-200`}
              >
                <Download className="w-5 h-5 mr-2" />
                Download as TXT
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
