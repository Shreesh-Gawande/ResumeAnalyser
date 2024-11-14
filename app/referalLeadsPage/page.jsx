"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../_components/Navbar';
import { 
  Briefcase, 
  Target, 
  Trophy,
  Building2,
  ArrowRight,
  Users,
  Loader2,
} from 'lucide-react';

const JobMatchingPage = () => {
  const [resumeData, setResumeData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  function cleanMarkdownJson(text) {
    // Remove lines that start with ``` and any language identifier
    return text
        .split('\n')
        .filter(line => !line.trim().startsWith('```'))
        .join('\n');
}

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // Retrieve the stored resume data
        const storedData = sessionStorage.getItem('resumeData');
        if (!storedData) {
          throw new Error('No resume data found');
        }

        const parsedData = JSON.parse(storedData);
        setResumeData(parsedData);

        // Create FormData for the API request
        const formData = new FormData();
        
        // Convert base64 back to file
        const fetchResponse = await fetch(parsedData.content);
        const blob = await fetchResponse.blob();
        const file = new File([blob], parsedData.name, { type: parsedData.type });
        formData.append('resume', file);

        // Make the API request
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await axios.post(`${baseUrl}/api/analyzeRecomendation`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('API Response:', response.data); // Debug log
        
        // Ensure we're getting an array from summary
        const cleanJson = cleanMarkdownJson(response.data.summary);
        const analysisData = JSON.parse(cleanJson);
  
        if (!Array.isArray(analysisData)) {
          console.log('Analysis data is not an array:', analysisData); // Debug log
          // If summary is an object with nested data, you might need to access it differently
          // Modify this according to your actual API response structure
          setAnalysis([analysisData]); // Wrap in array if it's a single object
        } else {
          setAnalysis(analysisData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error analyzing resume:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  // Helper function to determine match strength color
  const getMatchColor = (matchScore) => {
    if (matchScore >= 90) return 'text-green-600 bg-green-100';
    if (matchScore >= 75) return 'text-blue-600 bg-blue-100';
    if (matchScore >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const renderJobMatches = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-600 py-8">
          {error}
        </div>
      );
    }

    if (!analysis || analysis.length === 0) {
      return (
        <div className="text-center text-gray-600 py-8">
          No job matches available
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analysis?.map((match, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{match.company}</h3>
                <p className="text-gray-600 flex items-center mt-1">
                  <Building2 className="w-4 h-4 mr-2" />
                  {match.role}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full ${getMatchColor(match.matchScore)}`}>
                {match.matchScore}% Match
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Briefcase className="w-5 h-5 mr-2" />
                <span>{match.experience} years exp.</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {match.matchedSkills?.map((skill, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-purple-50 rounded-full text-sm text-purple-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center">
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <div className="inline-flex items-center bg-white rounded-full px-4 py-2 mb-6 shadow-sm">
              <Loader2 className={`w-5 h-5 text-purple-600 ${loading ? 'animate-spin' : ''} mr-2`} />
              <span className="text-purple-600 font-medium">
                {loading ? 'Finding your best matches' : 'Job matches ready'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Job Matches
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI-powered job matching based on your skills, experience, and career goals
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">94%</div>
                  <div className="text-gray-600">Match Accuracy</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">15</div>
                  <div className="text-gray-600">Top Matches</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">5k+</div>
                  <div className="text-gray-600">Network Size</div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Matches Section */}
          <div className="max-w-7xl mx-auto">
            {renderJobMatches()}
          </div>
        </div>
      </div>
    </>
  );
};

export default JobMatchingPage;