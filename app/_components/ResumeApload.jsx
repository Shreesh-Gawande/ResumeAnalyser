"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Updated import
import { Upload, CheckCircle, Shield, ArrowRight } from 'lucide-react';

const ResumeUpload = () => {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file input change
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Convert file to base64 for storage
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileData({
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          content: event.target.result,
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !fileData) {
      alert('Please select a file to upload.');
      return;
    }

    try {
      setLoading(true);
      
      // Store the file data in sessionStorage
      sessionStorage.setItem('resumeData', JSON.stringify(fileData));
      
      // Navigate to the next page
      router.push('/careerPath');
      
    } catch (error) {
      console.error('Error processing the file:', error);
      alert('An error occurred while processing the file.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { title: 'ATS Compatibility', description: 'Ensure your resume passes ATS systems' },
    { title: 'Keyword Analysis', description: 'Check for crucial industry keywords' },
    { title: 'Format Check', description: 'Verify professional formatting standards' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold mb-4">
              AI-Powered Resume Analysis
            </span>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Unlock Your Career's
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                {' '}Full Potential
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get instant, AI-powered feedback on your resume with our comprehensive 16-point analysis system.
            </p>
          </div>

          {/* Upload Section */}
          <form onSubmit={handleSubmit} className="text-center">
            <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors duration-300 rounded-lg p-8 mb-6">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="mb-4"
              />
              <div className="text-gray-600">
                {fileData ? `Selected: ${fileData.name}` : 'Drag & drop your resume or click to browse'}
              </div>
            </div>

            <button
              type="submit"
              className="group relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Get Started'}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {features.map((feature, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;