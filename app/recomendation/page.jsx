"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Circle,
  TrendingUp,
  Briefcase,
  Target,
  Award,
  BookOpen,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Clock,
  Star
} from 'lucide-react';
import Navbar from '../_components/Navbar';
import axios from 'axios';

const RecommendationPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  function cleanMarkdownJson(text) {
    return text
        .split('\n')
        .filter(line => !line.trim().startsWith('```'))
        .join('\n');
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedData = sessionStorage.getItem('resumeData');
        if (!storedData) {
          throw new Error('No resume data found');
        }
  
        const parsedData = JSON.parse(storedData);
  
        const formData = new FormData();
        const fetchResponse = await fetch(parsedData.content);
        const blob = await fetchResponse.blob();
        const file = new File([blob], parsedData.name, { type: parsedData.type });
        formData.append('resume', file);
  
        // Make the API request using axios
        const response = await axios.post('/api/analyzeProgress', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('API Response:', response.data); // Debug log
        
        const cleanJson = cleanMarkdownJson(response.data.summary);
        const analysisData = JSON.parse(cleanJson);
        
        // Set recommendations regardless of whether it's an array or object
        setRecommendations(analysisData);
        setLoading(false);
      } catch (err) {
        console.error('Error analyzing resume:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xl font-medium text-gray-700">Analyzing your resume...</p>
          <p className="text-sm text-gray-500">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="text-xl font-medium text-gray-700">Analysis Failed</p>
          <p className="text-gray-600 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  const { recommendation, actionPlan, careerProgress, skillGaps, recommendedCourses } = recommendations;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              Career Analysis Complete
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Personalized Career Roadmap
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Based on your experience and skills, we've crafted a tailored career development plan.
            </p>
          </div>

          {/* Primary Recommendation Card */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recommended Role</h2>
                <p className="text-gray-500">Based on your profile analysis</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full flex items-center text-sm font-medium">
                  <Star className="w-4 h-4 mr-2" />
                  {recommendation.matchScore}% Match
                </div>
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full flex items-center text-sm font-medium">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {recommendation.salary.currency} {recommendation.salary.min.toLocaleString()} - {recommendation.salary.max.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-2xl font-semibold text-blue-600 mb-3">{recommendation.role}</h3>
                <p className="text-gray-700 leading-relaxed">{recommendation.description}</p>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.keySkills.map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Action Plan Card */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Action Plan</h2>
                  <p className="text-gray-500">Steps to achieve your career goals</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <ul className="space-y-4">
                {actionPlan.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 p-4 rounded-lg bg-white transition-all hover:shadow-md"
                  >
                    {item.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                    )}
                    <div className="flex-grow">
                      <p className="text-gray-700 font-medium">{item.task}</p>
                      <p className="text-sm text-gray-500">Due in {Math.floor(Math.random() * 14) + 1} days</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                      item.priority === 'high' ? 'bg-red-100 text-red-700' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Career Progress Card */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Career Progress</h2>
                  <p className="text-gray-500">Your journey to the next level</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-700">Current: {careerProgress.currentStage}</span>
                    <span className="font-medium text-blue-600">{careerProgress.stageProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${careerProgress.stageProgress}%` }}
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-gray-700">
                      <strong>Next Level:</strong> {careerProgress.nextMilestone}
                    </p>
                    <p className="text-gray-700">
                      <strong>Estimated Timeline:</strong> {careerProgress.timeToNextLevel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skill Gaps Card */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Skills to Develop</h2>
                  <p className="text-gray-500">Focus areas for growth</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillGaps.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg">
                    <ChevronRight className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Courses Card */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recommended Courses</h2>
                  <p className="text-gray-500">Curated learning paths</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div className="space-y-4">
                {recommendedCourses.map((course, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-2">{course.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {course.provider}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration}
                      </span>
                      <span className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        {course.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecommendationPage;