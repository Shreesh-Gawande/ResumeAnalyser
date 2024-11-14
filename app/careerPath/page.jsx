"use client"
import React, { useEffect, useState } from 'react';
import Navbar from '../_components/Navbar';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowRight, Coins, TrendingUp, Award, Loader2 } from 'lucide-react';

const CareerInsightsPage = () => {
  const [resumeData, setResumeData] = useState(null);
  const [analysis, setAnalysis] = useState([]);

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
        const storedData = sessionStorage.getItem('resumeData');
        if (!storedData) {
          throw new Error('No resume data found');
        }
  
        const parsedData = JSON.parse(storedData);
        setResumeData(parsedData);
  
        const formData = new FormData();
        const fetchResponse = await fetch(parsedData.content);
        const blob = await fetchResponse.blob();
        const file = new File([blob], parsedData.name, { type: parsedData.type });
        formData.append('resume', file);
  
        // Make the API request
        const response = await axios.post('/api/analyzeResume', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        console.log('API Response:', response.data); // Debug log
        console.log(response.data.summary);
        
        const cleanJson = cleanMarkdownJson(response.data.summary);
        const analysisData = JSON.parse(cleanJson);
  
        // Check if the summary is an array or an object
        if (!Array.isArray(analysisData)) {
          console.log('Analysis data is not an array:', analysisData);
          // Fallback if it's an object or single item
          setAnalysis([analysisData]); // Wrap in array if it's a single object
        } else if (Array.isArray(analysisData)) {
          setAnalysis(analysisData);
        } else {
          console.error('Unexpected format for analysis data');
          setAnalysis([analysisData]); // Set as empty array if the format is unexpected
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
  
  
  // Helper function to determine gradient color based on experience level
  const getGradientColor = (index, total) => {
    const colors = [
      'from-purple-500 to-purple-600',
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600'
    ];
    return colors[index % colors.length];
  };
 

  const renderCareerTimeline = () => {
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

    if (!analysis || !Array.isArray(analysis) || analysis.length === 0) {
      return (
        <div className="text-center text-gray-600 py-8">
          No career data available
        </div>
      );
    }

    return analysis.map((stage, index) => (
      <div key={index} className="relative">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getGradientColor(index, analysis.length)} flex items-center justify-center text-white font-bold shrink-0`}>
            {index + 1}
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {stage.title || 'Career Stage'}
            </h3>
            <p className="text-gray-600 mb-4">
              {stage.description || stage.experience || 'No description available'}
            </p>
            {stage.skills && Array.isArray(stage.skills) && (
              <div className="flex flex-wrap gap-2">
                {stage.skills.map((skill, skillIndex) => (
                  <span key={skillIndex} className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border border-gray-200">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {index < analysis.length - 1 && (
          <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-purple-200 to-transparent h-16" />
        )}
      </div>
    ));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <div className="inline-flex items-center bg-white rounded-full px-4 py-2 mb-6 shadow-sm">
              <Loader2 className={`w-5 h-5 text-purple-600 ${loading ? 'animate-spin' : ''} mr-2`} />
              <span className="text-purple-600 font-medium">
                {loading ? 'Analyzing your profile' : 'Profile analysis complete'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Career Evolution
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI-powered insights to guide your professional journey and maximize your potential
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Coins className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Salary Negotiation Guide</h3>
                  <p className="text-gray-600 mb-4">Learn proven strategies to negotiate better compensation packages</p>
                  <button className="inline-flex items-center text-green-600 font-medium hover:text-green-700">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry Pay Scale</h3>
                  <p className="text-gray-600 mb-4">Compare your compensation with industry standards</p>
                  <button className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700">
                    View Analysis <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Career Path Timeline */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-8">
              <Award className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Your Career Timeline</h2>
            </div>
            <div className="space-y-8">
              {renderCareerTimeline()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CareerInsightsPage;