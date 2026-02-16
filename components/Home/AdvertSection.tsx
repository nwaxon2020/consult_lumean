'use client';
import React from 'react';
import { PharmacyHub } from './Adverts/PharmacyHub';
import { WellnessHub } from './Adverts/WellnessHub';
import { PreventionHub } from './Adverts/PreventionHub';
import { BlogHub } from './Adverts/BlogHub';

const adverts = [
    {
        id: 1,
        title: 'Pharmacy & Drugs',
        bgImage: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=1000',
        color: 'from-blue-600 to-blue-900',
        products: [
        { id: 1, name: 'Amoxicillin 500mg', manufacturer: 'Pfizer', price: 2499, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500' },
        { id: 2, name: 'Vitamin D3 2000 IU', manufacturer: 'Nature Bounty', price: 1599, image: 'https://boldhealthinc.com/wp-content/uploads/2022/09/Prescription-Drug-Abuse-1200x670.png' },
        { id: 3, name: 'Ibuprofen 200mg', manufacturer: 'Advil', price: 1299, image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=500' },
        { id: 4, name: 'Paracetamol', manufacturer: 'Emzor', price: 450, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500' },
        { id: 6, name: 'Amoxicillin 500mg', manufacturer: 'Pfizer', price: 2499, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500' },
        { id: 7, name: 'Vitamin D3 2000 IU', manufacturer: 'Nature Bounty', price: 1599, image: 'https://boldhealthinc.com/wp-content/uploads/2022/09/Prescription-Drug-Abuse-1200x670.png' },
        { id: 8, name: 'Ibuprofen 200mg', manufacturer: 'Advil', price: 1299, image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=500' },
        { id: 9, name: 'Paracetamol', manufacturer: 'Emzor', price: 450, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500' }
        ]
    },

    {
        id: 2,
        title: 'Healthy Living',
        bgImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000',
        color: 'from-green-600 to-green-900',
        workouts: [
        { id: 1, name: 'Morning Yoga', duration: '20 min', calories: 120, level: 'Beginner', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500', 
            videos: [
                { title: 'Yoga for Beginners', videoId: 'C2RAjUEAoLI' },
                { title: '15-Minute Full Body Yoga Workout', videoId: 'iGZim9_ku-Q' },
                { title: 'Cool Bedtime Yoga & Stretch', videoId: 'ChHxbJuUR9Q' }
            ]
        },

        { id: 2, name: 'HIIT Cardio', duration: '15 min', calories: 200, level: 'Intermediate', image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=500', 
            videos: [
                { title: 'MIN CARDIO HIIT WORKOUT', videoId: 'FeR-4_Opt-g' },
                { title: '20 MINUTE FULL BODY WORKOUT', videoId: 'wIynl3at0Rs' },
                { title: 'Body Dumbbell Workout', videoId: 'xqVBoyKXbsA' }
            ]
        },

        { id: 3, name: 'Strength Training', duration: '40 min', calories: 350, level: 'Advanced', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500', 
            videos: [
                { title: 'Intro & Breathing', videoId: 'qsGpE8OKi1o' },
                { title: 'The Treadmill Workout', videoId: 'eGZ_3MbXAnM' },
                { title: 'Out door workout', videoId: 'xXQcZe2BmRM' }
            ]
        },

        { id: 4, name: 'Anima Workout', duration: '10 min', calories: 30, level: 'Beginner', image: 'https://media.istockphoto.com/id/2075354173/photo/fitness-couple-is-doing-kettlebell-twist-in-a-gym-togehter.jpg?s=612x612&w=0&k=20&c=lfs1V1d0YB33tn72myi6FElJnylPJYYM9lW5ZhlnYqY=', 
            videos: [
                { title: 'Anima workout tutorial 1', videoId: '26t2WVY9ITo' },
                { title: 'Anima workout tutorial 2', videoId: '28ycJRtbN2g' },
                { title: 'Anima workout tutorial 3', videoId: 'h57HHmYSo2w' }
            ]
        }

        ]
    },

    {
        id: 3,
        title: 'Disease Prevention',
        bgImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000',
        color: 'from-red-600 to-red-900',
        vaccines: [
            { 
            id: 1, 
            name: 'Malaria Prevention', 
            tag: 'Common', 
            image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=500',
            longDescription: 'Malaria is caused by Plasmodium parasites transmitted through the bites of infected female Anopheles mosquitoes. It remains a leading cause of illness in tropical regions.',
            preventionTips: [
                'Sleep under long-lasting insecticide-treated nets (LLINs).',
                'Use mosquito repellent creams on exposed skin.',
                'Clear stagnant water around your home to prevent breeding.',
                'Install insecticide-treated screens on windows and doors.'
            ]
            },
            { 
            id: 2, 
            name: 'Typhoid Fever', 
            tag: 'Hygiene', 
            image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500',
            longDescription: 'Typhoid is a bacterial infection caused by Salmonella Typhi. It spreads through contaminated food and water or close contact with an infected person.',
            preventionTips: [
                'Drink only treated, bottled, or boiled water.',
                'Wash hands thoroughly with soap after using the toilet.',
                'Avoid eating raw fruits or vegetables that cannot be peeled.',
                'Ensure all food is cooked thoroughly and served hot.'
            ]
            },
            { 
            id: 3, 
            name: 'Cholera Awareness', 
            tag: 'Critical', 
            image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500',
            longDescription: 'Cholera is an acute diarrheal infection caused by ingestion of food or water contaminated with the bacterium Vibrio cholerae. It can cause severe dehydration if untreated.',
            preventionTips: [
                'Practice strict hand hygiene before handling food.',
                'Use "Wash-Hand" stations or sanitizers frequently.',
                'Ensure proper disposal of waste and sewage.',
                'Boil water used for brushing teeth or washing food.'
            ]
            },
            { 
            id: 4, 
            name: 'Lassa Fever', 
            tag: 'Viral', 
            image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500',
            longDescription: 'Lassa fever is an animal-borne viral hemorrhagic fever transmitted to humans through contact with food or household items contaminated with rodent urine or feces.',
            preventionTips: [
                'Store grains and food items in rodent-proof containers.',
                'Dispose of garbage far from the house to avoid attracting rats.',
                'Maintain a clean environment and block all rat hideouts.',
                'Avoid drying food items on the floor or open surfaces.'
            ]
            }
        ]
    },

    {
        id: 4,
        title: 'Blog & Events',
        bgImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000',
        color: 'from-purple-600 to-purple-900',
        articles: [
        { id: 1, title: 'Lagos Outreach', type: 'video', description: 'Free checkups for 500+ residents.', longDescription: 'Full story of our mission in Lagos...', date: 'Feb 10, 2026', mediaUrl: 'NyNVAXzQFP8' },
        { id: 2, title: 'Surgery Seminar', type: 'image', description: 'Future of robotic surgery.', longDescription: 'Detailed seminar notes on robotics...', date: 'Jan 15, 2026', mediaUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800' },
        { id: 3, title: 'New Clinic Launch', type: 'image', description: 'Opening our new branch.', longDescription: 'Photos from the ribbon-cutting ceremony...', date: 'Dec 12, 2025', mediaUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800' },
        { id: 4, title: 'Health & AI', type: 'video', description: 'How AI is helping doctors.', longDescription: 'A talk on artificial intelligence in medicine...', date: 'Nov 05, 2025', mediaUrl: '/video4.mp4' }
        ]
    }
];

const AdvertSection = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <PharmacyHub advert={adverts[0]} />
        <WellnessHub advert={adverts[1]} />
        <PreventionHub advert={adverts[2]} />
        <BlogHub advert={adverts[3]} />
      </div>
    </div>
  );
};

export default AdvertSection;