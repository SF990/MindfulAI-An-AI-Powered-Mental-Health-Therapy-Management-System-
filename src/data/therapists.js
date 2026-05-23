export const therapists = [
  {
    id: 1,
    name: "Dr. Saima Naz",
    title: "Consultant Psychiatrist",
    qualification: "MBBS, FCPS (Psychiatry)",
    hospital: "Allied Hospital Faisalabad",
    clinic: "Mind Wellness Clinic, Peoples Colony",
    specialty: ["Depression", "Anxiety Disorders", "OCD", "Schizophrenia"],
    experience: "18 years",
    fee: 2000,
    rating: 4.8,
    reviews: 214,
    available: ["Mon", "Wed", "Fri"],
    times: ["10:00 AM", "11:00 AM", "12:00 PM", "3:00 PM", "4:00 PM"],
    image: null,
    initials: "SN",
    color: "#7C9E8A",
    bio: "Dr. Saima Naz is a highly experienced consultant psychiatrist with over 18 years in clinical practice. She specializes in mood disorders, anxiety, and psychotic conditions, offering evidence-based CBT and medication management.",
    languages: ["Urdu", "Punjabi", "English"],
  },
  {
    id: 2,
    name: "Dr. Imran Khalid",
    title: "Clinical Psychologist",
    qualification: "PhD (Clinical Psychology), University of the Punjab",
    hospital: "Faisalabad Institute of Cardiology",
    clinic: "Healing Minds Psychology Center, D-Ground",
    specialty: ["CBT", "Trauma & PTSD", "Couples Therapy", "Addiction"],
    experience: "12 years",
    fee: 1500,
    rating: 4.9,
    reviews: 187,
    available: ["Tue", "Thu", "Sat"],
    times: ["9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM", "5:00 PM"],
    image: null,
    initials: "IK",
    color: "#C4855A",
    bio: "Dr. Imran Khalid is a certified CBT practitioner and trauma specialist. He brings an integrative approach combining cognitive-behavioral techniques with mindfulness, helping clients achieve lasting psychological wellness.",
    languages: ["Urdu", "Punjabi", "English"],
  },
  {
    id: 3,
    name: "Dr. Ayesha Farooq",
    title: "Psychiatrist & Psychotherapist",
    qualification: "MBBS, MRCPsych (UK), Dip. Psychotherapy",
    hospital: "Government General Hospital, Faisalabad",
    clinic: "Serenity Psychiatric Clinic, Gulberg Road",
    specialty: ["Child & Adolescent Psychiatry", "ADHD", "Bipolar Disorder", "Postpartum Depression"],
    experience: "14 years",
    fee: 2500,
    rating: 4.7,
    reviews: 156,
    available: ["Mon", "Tue", "Thu"],
    times: ["11:00 AM", "12:00 PM", "1:00 PM", "4:00 PM"],
    image: null,
    initials: "AF",
    color: "#D4A847",
    bio: "Dr. Ayesha Farooq trained in the UK and returned to serve Faisalabad's mental health community. She specializes in childhood mental health, adolescent issues, and perinatal psychiatry with a compassionate, family-centered approach.",
    languages: ["Urdu", "Punjabi", "English"],
  },
  {
    id: 4,
    name: "Dr. Muhammad Asif Raza",
    title: "Senior Consultant Psychiatrist",
    qualification: "MBBS, MCPS, FCPS (Psychiatry)",
    hospital: "DHQ Hospital Faisalabad",
    clinic: "Raza Neuro-Psychiatric Clinic, Kotwali Road",
    specialty: ["Neuropsychiatry", "Epilepsy & Psychiatry", "Dementia", "Sleep Disorders"],
    experience: "22 years",
    fee: 2000,
    rating: 4.6,
    reviews: 302,
    available: ["Mon", "Wed", "Sat"],
    times: ["9:00 AM", "10:00 AM", "11:00 AM", "3:00 PM"],
    image: null,
    initials: "MR",
    color: "#6B8CAE",
    bio: "With over two decades of experience, Dr. Muhammad Asif Raza is one of Faisalabad's most trusted psychiatrists. His expertise in neuropsychiatry bridges the gap between neurological and psychiatric conditions.",
    languages: ["Urdu", "Punjabi"],
  },
  {
    id: 5,
    name: "Ms. Hira Baig",
    title: "Counseling Psychologist",
    qualification: "M.Phil (Clinical Psychology), GC University Faisalabad",
    hospital: "Faisalabad Medical University",
    clinic: "Inner Peace Counseling, Canal Road",
    specialty: ["Grief & Loss", "Relationship Issues", "Self-Esteem", "Career Counseling"],
    experience: "8 years",
    fee: 1000,
    rating: 4.8,
    reviews: 129,
    available: ["Tue", "Wed", "Thu", "Fri"],
    times: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"],
    image: null,
    initials: "HB",
    color: "#9B7DB5",
    bio: "Ms. Hira Baig provides warm, non-judgmental counseling for individuals navigating life transitions, relationship challenges, and personal growth. Her accessible fee makes quality mental health care available to all.",
    languages: ["Urdu", "Punjabi", "English"],
  },
  {
    id: 6,
    name: "Dr. Tariq Mahmood",
    title: "Addiction Psychiatrist",
    qualification: "MBBS, Dip. Addiction Medicine (CPSP)",
    hospital: "Al-Shifa Trust Hospital Faisalabad",
    clinic: "New Life Addiction Center, Jinnah Colony",
    specialty: ["Substance Abuse", "Alcohol Dependency", "Rehabilitation", "Dual Diagnosis"],
    experience: "16 years",
    fee: 1800,
    rating: 4.5,
    reviews: 98,
    available: ["Mon", "Tue", "Thu", "Sat"],
    times: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"],
    image: null,
    initials: "TM",
    color: "#5B8A7A",
    bio: "Dr. Tariq Mahmood is a dedicated addiction psychiatrist who has helped hundreds of patients reclaim their lives. He offers a confidential, stigma-free environment and a comprehensive rehabilitation approach.",
    languages: ["Urdu", "Punjabi"],
  },
];

export const DB_APPOINTMENTS_KEY = 'therapy_ai_appointments';

export async function getAppointments(userId) {
  if (userId) {
    try {
      const response = await fetch(`http://localhost:8000/api/appointments/${userId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Backend unavailable, falling back to localStorage:", error);
    }
  }
  try {
    return JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || '[]');
  } catch { return []; }
}

export async function saveAppointment(appt) {
  try {
    const response = await fetch("http://localhost:8000/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appt),
    });
    if (response.ok) {
      const data = await response.json();
      return data.appointment;
    }
    throw new Error("API responded with an error");
  } catch (error) {
    console.warn("Backend unavailable, saving to localStorage fallback:", error);
    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || '[]');
    } catch (e) {
      existing = [];
    }
    const fallbackAppt = {
      ...appt,
      id: Date.now().toString(),
      bookedAt: new Date().toISOString(),
      status: "pending (local)"
    };
    existing.push(fallbackAppt);
    localStorage.setItem(DB_APPOINTMENTS_KEY, JSON.stringify(existing));
    return fallbackAppt;
  }
}
