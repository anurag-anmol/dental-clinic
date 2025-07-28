"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AppointmentRequestForm } from "@/components/appointment-request-form"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import Image from "next/image"


interface Service {
  id: number
  title: string
  description: string
  image: string
}

interface LandingContent {
  hero: {
    title: string
    subtitle: string
    cta_text: string
    background_image: string
  }
  services: {
    title: string
    services_data: Service[]
  }
  about: {
    title: string
    description_1: string
    description_2: string
    image: string
  }
  contact: {
    title: string
    subtitle: string
    phone: string
    email: string
    address: string
    hours: string
  }
}
export default function LandingPage() {
  const [content, setContent] = useState<LandingContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/landing-content")
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        console.error("Failed to fetch content")
      }
    } catch (error) {
      console.error("Error fetching content:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Image src={'/favicon.ico'} width={50} height={50} alt='loading' className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Fallback content
  const defaultContent: LandingContent = {
    hero: {
      title: "Your Brightest Smile Starts Here",
      subtitle: "Providing compassionate and comprehensive dental care for your entire family.",
      cta_text: "Book Your Appointment",
      background_image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=1170&auto=format&fit=crop",
    },
    services: {
      title: "Our Services",
      services_data: [
        {
          id: 1,
          title: "General Dentistry",
          description: "Routine check-ups, cleanings, fillings, and preventive care.",
          image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1168&auto=format",
        },
        {
          id: 2,
          title: "Cosmetic Dentistry",
          description: "Teeth whitening, veneers, and bonding to enhance your smile.",
          image: "https://plus.unsplash.com/premium_photo-1661434856831-76779e04e8bc?q=80&w=1138&auto=format",
        },
        {
          id: 3,
          title: "Orthodontics",
          description: "Braces and clear aligners for misaligned teeth.",
          image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=2070&auto=format",
        },
      ],
    },
    about: {
      title: "About Our Clinic",
      description_1: "We provide exceptional dental care in a friendly environment.",
      description_2: "We believe in patient education and personalized care.",
      image: "https://images.unsplash.com/photo-1473232117216-c950d4ef2e14?q=80&w=1127&auto=format",
    },
    contact: {
      title: "Contact Us",
      subtitle: "Have questions or need to schedule an appointment?",
      phone: "+1 (123) 456-7890",
      email: "info@dentalclinicpro.com",
      address: "123 Dental Ave, Suite 100",
      hours: "Mon-Fri: 9:00 AM - 5:00 PM",
    },
  }

  // Safely merge content with default fallback
  const displayHero = content?.hero ?? defaultContent.hero
  const displayServices = content?.services ?? defaultContent.services
  const displayAbout = content?.about ?? defaultContent.about
  const displayContact = content?.contact ?? defaultContent.contact

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header for Landing Page */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Dr.</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Ram Ratre-Dental Clinic</h1>
            </Link>
            <nav className="space-x-4">
              <Button asChild variant="ghost">
                <Link href="#services">Services</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="#about">About Us</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="#contact">Contact</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */} <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={displayHero.background_image}
            alt="Dental Clinic Background"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            {displayHero.title}
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            {displayHero.subtitle}
          </p>
          <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
            <Link href="#appointment">{displayHero.cta_text}</Link>
          </Button>
        </div>
      </section>


      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{displayServices.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayServices.services_data.map((service) => (
              <div key={service.id} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <img src={service.image} alt={service.title} className="mb-4" />
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* About Us Section */}<section id="about" className="py-16 md:py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{displayAbout.title}</h2>
            <p className="text-lg text-gray-700 mb-4">{displayAbout.description_1}</p>
            <p className="text-lg text-gray-700">{displayAbout.description_2}</p>
          </div>
          <div>
            <img src={displayAbout.image} alt="Clinic" className="rounded-lg shadow-lg" />
          </div>
        </div>
      </section>


      {/* Appointment Request Section */}
      <section id="appointment" className="py-16 md:py-24 bg-blue-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AppointmentRequestForm />
        </div>
      </section>


      {/* Contact Section */}  <section id="contact" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{displayContact.title}</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">{displayContact.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <Phone className="h-10 w-10 text-blue-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p className="text-gray-700">{displayContact.phone}</p>
            </div>
            <div className="flex flex-col items-center">
              <Mail className="h-10 w-10 text-blue-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-gray-700">{displayContact.email}</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-10 w-10 text-blue-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Address</h3>
              <p className="text-gray-700">{displayContact.address}</p>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4 text-gray-600">
            <Clock className="h-5 w-5" />
            <span>{displayContact.hours}</span>
          </div>
        </div>
      </section>

      {/* Footer for Landing Page */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">Dr.</span>
            </div>
            <span className="text-gray-300">Ram Ratre-Dental Clinic</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">© 2024 Ram Ratre-Dental Clinic. All rights reserved.</p>
          <div className="space-x-4 text-sm">
            <Link href="#" className="text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
