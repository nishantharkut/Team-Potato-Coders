"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { toast } from 'sonner'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact-us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({
          name: "",
          email: "",
          company: "",
          phone: "",
          message: ""
        });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="bg-white border-4 border-black rounded-xl shadow-neu p-6 md:p-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-xl bg-demon-red border-4 border-black flex items-center justify-center shadow-neu-sm">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="logo-font text-4xl md:text-5xl text-tanjiro-green text-shadow-medium">
                Contact Us
              </h1>
              <p className="text-base md:text-lg text-charcoal/70 font-medium mt-1">
                Get in touch with our team
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-cream">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-black text-charcoal">
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-base font-medium text-charcoal/70">
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        type="text"
                        id="name"
                        placeholder="Your full name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        type="email"
                        id="email"
                        placeholder="your.email@example.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        type="text"
                        id="company"
                        placeholder="Your company name"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        type="tel"
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="min-h-[180px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 font-bold text-base gap-2"
                  >
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="bg-cream">
              <CardHeader>
                <CardTitle className="text-xl font-black text-charcoal">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-tanjiro-green border-3 border-black flex items-center justify-center shadow-neu-sm flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-charcoal mb-1">Email</p>
                    <p className="text-sm font-medium text-charcoal/70">
                      support@uproot.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-demon-red border-3 border-black flex items-center justify-center shadow-neu-sm flex-shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-charcoal mb-1">Phone</p>
                    <p className="text-sm font-medium text-charcoal/70">
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-earthy-orange border-3 border-black flex items-center justify-center shadow-neu-sm flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-charcoal mb-1">Office</p>
                    <p className="text-sm font-medium text-charcoal/70">
                      123 Career Street<br />
                      San Francisco, CA 94102
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-tanjiro-green/10 border-3 border-tanjiro-green">
              <CardContent className="pt-6">
                <p className="text-base font-bold text-charcoal leading-relaxed">
                  Need immediate assistance? Our support team is available 24/7 to help you with any questions or concerns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage