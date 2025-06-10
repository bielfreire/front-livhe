import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import Layout from "@/components/Layout";

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#1A1C24] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-[#FFD110]">{t('contact.title', 'Contact Us')}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-[#2A2D36] p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">{t('contact.getInTouch', 'Get in Touch')}</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-[#FFD110]" />
                    <span>applivhe@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-[#FFD110]" />
                    <a 
                      href="https://discord.gg/ckg73XfN" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-[#FFD110] transition-colors"
                    >
                      {t('contact.discord', 'Join our Discord Community')}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            {/* <div className="bg-[#2A2D36] p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">{t('contact.sendMessage', 'Send us a Message')}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    {t('contact.name', 'Name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#1A1C24] border border-[#3A3D46] rounded-lg focus:outline-none focus:border-[#FFD110]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    {t('contact.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#1A1C24] border border-[#3A3D46] rounded-lg focus:outline-none focus:border-[#FFD110]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">
                    {t('contact.subject', 'Subject')}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#1A1C24] border border-[#3A3D46] rounded-lg focus:outline-none focus:border-[#FFD110]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    {t('contact.message', 'Message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 bg-[#1A1C24] border border-[#3A3D46] rounded-lg focus:outline-none focus:border-[#FFD110]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#FFD110] text-black font-medium py-2 px-4 rounded-lg hover:bg-[#FFD110]/90 transition-colors"
                >
                  {t('contact.send', 'Send Message')}
                </button>
              </form>
            </div> */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact; 