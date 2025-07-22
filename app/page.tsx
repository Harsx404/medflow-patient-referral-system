"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NavigationLogo } from '@/components/ui/logo'
import { 
  Heart, 
  Shield, 
  FileText, 
  Users, 
  Clock,
  ArrowRight,
  CheckCircle,
  Zap
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-slate-900">Grass Tree Group</div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/doctor-login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  Doctor Portal
                </Button>
              </Link>
              <Link href="/admin">
                <Button className="bg-green-600 text-white hover:bg-green-700">
                  Admin Access
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
            <Badge className="mb-6 bg-green-50 text-green-700 border-green-200">
              Professional Healthcare Services
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-slate-900">
              Quality Healthcare
              <span className="text-green-600"> Management Solutions</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Grass Tree Group provides comprehensive healthcare management services with advanced patient referral systems designed for modern medical practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin">
                <Button size="lg" className="bg-green-600 text-white hover:bg-green-700 px-8 py-4 text-lg font-medium">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/doctor-login">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg">
                  Doctor Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="border-t border-slate-200 py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">About Grass Tree Group</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              We are dedicated to improving healthcare delivery through innovative technology solutions. 
              Our patient referral management system streamlines workflows and enhances care coordination 
              between healthcare providers.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Our Healthcare Services</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive healthcare management solutions designed to improve patient care and streamline medical workflows.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Patient Referral Management */}
            <Card className="bg-white border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="p-3 bg-green-50 rounded-lg w-fit">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Patient Referral Management</h3>
                <p className="text-slate-600 mb-4">
                  Streamlined referral processing system that connects patients with the right specialists efficiently and accurately.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Digital referral processing
                  </div>
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Specialist matching
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Healthcare Coordination */}
            <Card className="bg-white border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="p-3 bg-blue-50 rounded-lg w-fit">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Healthcare Coordination</h3>
                <p className="text-slate-600 mb-4">
                  Seamless communication and coordination between healthcare providers to ensure continuity of care.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Provider communication
                  </div>
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Care coordination
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Assurance */}
            <Card className="bg-white border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="p-3 bg-purple-50 rounded-lg w-fit">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Quality Assurance</h3>
                <p className="text-slate-600 mb-4">
                  Comprehensive quality monitoring and reporting to ensure the highest standards of healthcare delivery.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Quality monitoring
                  </div>
                  <div className="flex items-center text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Compliance reporting
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
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Why Choose Grass Tree Group</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Dedicated to providing exceptional healthcare services with a focus on quality, efficiency, and patient satisfaction.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="p-4 bg-white rounded-lg shadow-sm mb-4 w-fit mx-auto">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold mb-2 text-slate-900">Patient-Centered Care</h3>
              <p className="text-slate-600 text-sm">Putting patients first in every decision we make</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-white rounded-lg shadow-sm mb-4 w-fit mx-auto">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2 text-slate-900">Expert Team</h3>
              <p className="text-slate-600 text-sm">Experienced healthcare professionals you can trust</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-white rounded-lg shadow-sm mb-4 w-fit mx-auto">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2 text-slate-900">Quality Standards</h3>
              <p className="text-slate-600 text-sm">Maintaining the highest standards of healthcare delivery</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-white rounded-lg shadow-sm mb-4 w-fit mx-auto">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-bold mb-2 text-slate-900">Efficient Service</h3>
              <p className="text-slate-600 text-sm">Streamlined processes for faster, better outcomes</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to experience quality healthcare?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Contact Grass Tree Group today to learn more about our comprehensive healthcare services and how we can help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Heart className="h-8 w-8 text-green-500 mr-3" />
                <span className="text-2xl font-bold">Grass Tree Group</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Dedicated to providing exceptional healthcare services with a focus on quality, efficiency, and patient satisfaction.
              </p>
              <div className="flex space-x-4">
                <div className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Services</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Patient Referrals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Healthcare Coordination</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Quality Assurance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Medical Consultation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Locations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Grass Tree Group. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}