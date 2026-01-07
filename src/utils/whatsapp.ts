export const formatWhatsAppNumber = (phone: string | null) => {
  if (!phone) return null;
  
  // Hapus karakter non-digit
  let cleanNumber = phone.replace(/\D/g, '');

  // Ganti '0' di depan dengan '62'
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.slice(1);
  }
  
  // Jika tidak ada kode negara, tambahkan 62 (asumsi nomor Indonesia)
  if (!cleanNumber.startsWith('62') && cleanNumber.length > 0) {
    cleanNumber = '62' + cleanNumber;
  }

  return cleanNumber;
};

export const openWhatsApp = (phone: string | null, message: string = '') => {
  const formattedNumber = formatWhatsAppNumber(phone);
  
  if (!formattedNumber || formattedNumber.length < 10) {
    alert('Nomor telepon tidak valid atau belum diisi.');
    return;
  }
  
  const encodedMessage = encodeURIComponent(message);
  // Menggunakan wa.me agar universal (mobile & web)
  window.open(`https://wa.me/${formattedNumber}?text=${encodedMessage}`, '_blank');
};

// Nomor Admin Bimbel Cendekia
export const ADMIN_PHONE = '085555555684';
