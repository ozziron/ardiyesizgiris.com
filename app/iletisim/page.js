"use client"; // Bu satır ÇOK ÖNEMLİ! Form etkileşimi için gereklidir.

import React, { useState } from 'react';

// --- Stil Objeleri Component'in Dışında Tanımlanıyor ---

const mainStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '8rem 1.5rem 4rem 1.5rem', width: '100%',
};

const contentWrapperStyle = {
  maxWidth: '700px', width: '100%', textAlign: 'center',
};

const titleStyle = {
  fontSize: '2.8rem', fontWeight: '600', marginBottom: '1rem', color: '#FFFFFF',
};

const subtitleStyle = {
  fontSize: '1.2rem', marginBottom: '3.5rem', color: '#a0aec0', // Daha soluk bir renk
};

// YENİ EKLENEN STİLLER
const formStyle = {
  display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%',
};

const inputGroupStyle = {
  textAlign: 'left',
};

const labelStyle = {
  display: 'block', marginBottom: '0.5rem', color: '#cbd5e0',
};

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: '6px',
  backgroundColor: '#2d3748', border: '1px solid #4a5568',
  color: '#FFFFFF', fontSize: '1rem',
};

const textareaStyle = {
  ...inputStyle, // inputStyle'ın tüm özelliklerini miras alır
  minHeight: '120px', resize: 'vertical',
};

const buttonStyle = {
  padding: '0.8rem 1.5rem', borderRadius: '6px', backgroundColor: '#38A169', // Yeşil tonu
  color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 'bold',
  border: 'none', cursor: 'pointer', transition: 'background-color 0.2s',
};


// --- Component Fonksiyonu ---

const IletisimPage = () => {
  // Form verilerini tutmak için state yönetimi
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Formun sayfayı yenilemesini engelle
    console.log("Form Verileri:", formData);
    // TODO: Form verilerini bir API'ye gönderme mantığı buraya eklenecek
    setIsSubmitted(true);
  };

  return (
    <main style={mainStyle}>
      <div style={contentWrapperStyle}>
        <h1 style={titleStyle}>Bize Ulaşın</h1>
        <p style={subtitleStyle}>
          Sorularınız, önerileriniz veya iş birlikleri için aşağıdaki formu doldurabilirsiniz.
        </p>
        
        {isSubmitted ? (
          <p style={{ color: '#48BB78', fontSize: '1.2rem' }}>
            Mesajınız için teşekkür ederiz. En kısa sürede size geri dönüş yapacağız.
          </p>
        ) : (
          <form style={formStyle} onSubmit={handleSubmit}>
            <div style={inputGroupStyle}>
              <label htmlFor="name" style={labelStyle}>Adınız Soyadınız</label>
              <input type="text" id="name" name="name" required style={inputStyle} value={formData.name} onChange={handleChange} />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="email" style={labelStyle}>E-posta Adresiniz</label>
              <input type="email" id="email" name="email" required style={inputStyle} value={formData.email} onChange={handleChange} />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="subject" style={labelStyle}>Konu</label>
              <input type="text" id="subject" name="subject" required style={inputStyle} value={formData.subject} onChange={handleChange} />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="message" style={labelStyle}>Mesajınız</label>
              <textarea id="message" name="message" required style={textareaStyle} value={formData.message} onChange={handleChange}></textarea>
            </div>
            <button type="submit" style={buttonStyle}>Mesajı Gönder</button>
          </form>
        )}
      </div>
    </main>
  );
};

export default IletisimPage;
