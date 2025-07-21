"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NavigationLogo } from '@/components/ui/logo'
import { 
  Stethoscope, 
  Zap, 
  Shield, 
  Brain, 
  FileText, 
  BarChart3, 
  Users, 
  Clock,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <NavigationLogo />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/doctor-login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  Doctor Portal
                </Button>
              </Link>
              <Link href="/admin">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
              Healthcare workflow automation platform
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-slate-900">
              Streamline patient referrals with
              <span className="text-blue-600"> intelligent automation</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Advanced AI-powered referral management system designed for healthcare professionals. Reduce processing time by 80% and improve patient care coordination.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin">
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 text-lg font-medium">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/doctor-login">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg">
                  Doctor Access
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by section */}
      <section className="border-t border-slate-200 py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-500 mb-8">Trusted by leading healthcare institutions</p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-2xl font-bold text-slate-700">Sydney Health Network</div>
            <div className="text-2xl font-bold text-slate-700">Melbourne Medical Centre</div>
            <div className="text-2xl font-bold text-slate-700">Brisbane Care Group</div>
            <div className="text-2xl font-bold text-slate-700">Perth General Hospital</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Intelligent referral management</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Transform your healthcare workflow with AI-powered insights, automated processing, and seamless collaboration tools.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* AI-Powered Processing */}
            <Card className="bg-white border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="p-3 bg-blue-50 rounded-lg w-fit">
                    <Brain className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">AI-Powered Processing</h3>
                <p className="text-slate-600 mb-4">
                  Automatically extract and analyze patient information from referral documents with 99% accuracy using advanced AI.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Smart document parsing
                  </div>
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Automated data extraction
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Collaboration */}
            <Card className="bg-white border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="p-3 bg-green-50 rounded-lg w-fit">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Real-time Collaboration</h3>
                <p className="text-slate-600 mb-4">
                  Seamless communication between referring doctors and specialists with instant updates and notifications.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Live status tracking
                  </div>
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Instant notifications
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Analytics */}
            <Card className="bg-white border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="p-3 bg-purple-50 rounded-lg w-fit">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Advanced Analytics</h3>
                <p className="text-slate-600 mb-4">
                  Generate comprehensive reports and insights to optimize your referral workflow and improve patient outcomes.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Performance dashboards
                  </div>
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Outcome tracking
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900">Built for healthcare professionals</h2>
              <p className="text-xl text-slate-600 mb-8">
                MedFlow streamlines referral management by predicting workflow patterns and automating routine administrative tasks.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900">Smart Predictions</h3>
                    <p className="text-slate-600">AI predicts the most suitable specialists and suggests optimal referral pathways based on patient data.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900">Document Intelligence</h3>
                    <p className="text-slate-600">Automatically extract comprehensive patient data from PDFs and medical documents with enterprise-grade accuracy.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900">Real-time Updates</h3>
                    <p className="text-slate-600">Track referral status in real-time with automated notifications and comprehensive audit trails.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Processing referral...</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm font-mono text-green-600">
                      ✓ Patient data extracted<br/>
                      ✓ Specialist matched<br/>
                      ✓ Referral sent<br/>
                      → Awaiting response...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-900">Transform your referral workflow today</h2>
          <p className="text-xl text-slate-600 mb-8">
            Join healthcare professionals across Australia who trust MedFlow for efficient patient referral management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 text-lg font-medium">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/doctor-login">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg">
                Doctor Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-500 text-sm mb-4 md:mb-0">
              © 2024 MedFlow by Grass Tree Group. Transforming healthcare workflows across Australia.
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-500">
              <Link href="/privacy" className="hover:text-slate-700">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-700">Terms of Service</Link>
              <Link href="/support" className="hover:text-slate-700">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}