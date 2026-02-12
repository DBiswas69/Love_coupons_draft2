import React, { useState, useEffect } from "react";
import {
  Heart,
  Clock,
  HandHelping,
  Gift,
  Sparkles,
  CheckCircle,
  RotateCcw,
  Send,
  User,
  Search,
  Share2,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Lock,
  LogOut,
  ArrowLeft,
  Settings,
  Save,
  AlertTriangle,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

// --- PASTE YOUR FIREBASE CONFIG HERE ---
// Get this from Firebase Console > Project Settings > General > Your Apps
const firebaseConfig = {
  apiKey: "AIzaSyDVkimAQUreS99KzfxGJGbUA_aWJ-Du_po",
  authDomain: "love-coupons-89018.firebaseapp.com",
  projectId: "love-coupons-89018",
  storageBucket: "love-coupons-89018.firebasestorage.app",
  messagingSenderId: "430201610807",
  appId: "1:430201610807:web:414290e946fa9dbc9b55b2",
  measurementId: "G-CD7RR1WM2N",
};

// --- INITIALIZATION LOGIC ---
// We check if you have updated the config keys above.
const isConfigured =
  firebaseConfig.apiKey !== "AIzaSy..." &&
  firebaseConfig.authDomain !== "your-project.firebaseapp.com";

// FIX: Explicitly type these as 'any' to satisfy strict TypeScript compilers
let app: any = null;
let auth: any = null;
let db: any = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase Initialization Failed:", e);
  }
}

// Unique ID for your couple's data bucket
const appId = "our-love-coupons";

// --- COUPON DATA ---
const ALL_COUPONS = [
  // --- ACTS OF SERVICE (30) ---
  {
    id: 1,
    category: "service",
    title: "Dish Duty Hero",
    desc: "I wash/load all the dishes for the day.",
  },
  {
    id: 2,
    category: "service",
    title: "Queen for a Day",
    desc: "I agree to your plans for the entire day (within reason!).",
  },
  {
    id: 3,
    category: "service",
    title: "Breakfast in Bed",
    desc: "Served with your favorite morning beverage.",
  },
  {
    id: 4,
    category: "service",
    title: "Car Wash & Detail",
    desc: "I wash the car inside and out.",
  },
  {
    id: 5,
    category: "service",
    title: "Laundry Liberation",
    desc: "I wash, dry, and fold one load of laundry.",
  },
  {
    id: 6,
    category: "service",
    title: "Errand Runner",
    desc: "I handle one annoying errand you have been dreading.",
  },
  {
    id: 7,
    category: "service",
    title: "Gas Tank Refill",
    desc: "I fill up your car so you don’t have to.",
  },
  {
    id: 8,
    category: "service",
    title: "Trash Take-Out",
    desc: "I handle garbage and recycling for the week.",
  },
  {
    id: 9,
    category: "service",
    title: "Tech Support",
    desc: "I fix that one tech issue that’s been bugging you.",
  },
  {
    id: 10,
    category: "service",
    title: "Grocery Run",
    desc: "I go to the store with your list (and stick to it).",
  },
  {
    id: 11,
    category: "service",
    title: "Dinner Chef",
    desc: "I cook a homemade meal of your choice.",
  },
  {
    id: 12,
    category: "service",
    title: "Lunch Packer",
    desc: "I make your lunch for work/school tomorrow.",
  },
  {
    id: 13,
    category: "service",
    title: "Bathroom Deep Clean",
    desc: "I scrub the shower, sink, and toilet.",
  },
  {
    id: 14,
    category: "service",
    title: "Closet Organizer",
    desc: "I help you sort/organize a messy space.",
  },
  {
    id: 15,
    category: "service",
    title: "Plant Parent",
    desc: "I water and tend to all the plants.",
  },
  {
    id: 16,
    category: "service",
    title: "Bed Maker",
    desc: "I make the bed with hotel-corner precision.",
  },
  {
    id: 17,
    category: "service",
    title: "Heavy Lifting",
    desc: "I move that furniture or box you want moved.",
  },
  {
    id: 18,
    category: "service",
    title: "Phone Call Buffer",
    desc: "I make a difficult phone call/appointment for you.",
  },
  {
    id: 19,
    category: "service",
    title: "Spider Removal",
    desc: "I handle the creepy-crawly. You stay back.",
  },
  {
    id: 20,
    category: "service",
    title: "Vacuum Victory",
    desc: "I vacuum the whole house/apartment.",
  },
  {
    id: 21,
    category: "service",
    title: "Designated Driver",
    desc: "You enjoy the wine/cocktails; I drive us home.",
  },
  {
    id: 22,
    category: "service",
    title: "Sleeping Beauty",
    desc: "I get up with the alarm/kids/pets; you sleep in.",
  },
  {
    id: 23,
    category: "service",
    title: "Coffee Delivery",
    desc: "Brought to you wherever you are in the house.",
  },
  {
    id: 24,
    category: "service",
    title: "Outfit Steamer",
    desc: "I de-wrinkle your outfit for the day.",
  },
  {
    id: 25,
    category: "service",
    title: "Decision Maker",
    desc: "I choose what to eat/watch so you don’t have to.",
  },
  {
    id: 26,
    category: "service",
    title: "Kitchen Closer",
    desc: "I wipe down all counters and sweep the floor.",
  },
  {
    id: 27,
    category: "service",
    title: "Hydration Helper",
    desc: "I ensure your water bottle is washed and filled.",
  },
  {
    id: 28,
    category: "service",
    title: "Shoe Rescue",
    desc: "I clean up your favorite pair of shoes/boots/sneakers.",
  },
  {
    id: 29,
    category: "service",
    title: "Bag Carrier",
    desc: "I carry all the heavy bags on our shopping trip.",
  },
  {
    id: 30,
    category: "service",
    title: 'The "Fix It" Ticket',
    desc: "I repair something broken around the house.",
  },

  // --- QUALITY TIME (30) ---
  {
    id: 31,
    category: "time",
    title: "Tech-Free Evening",
    desc: "No phones for 2 hours, just us.",
  },
  {
    id: 32,
    category: "time",
    title: "Sunset Watch",
    desc: "We drive or walk somewhere to watch the sun go down.",
  },
  {
    id: 33,
    category: "time",
    title: "Movie Marathon",
    desc: "You pick the genre/franchise; I bring the popcorn.",
  },
  {
    id: 34,
    category: "time",
    title: "Stargazing",
    desc: "We lay on a blanket and look at the sky.",
  },
  {
    id: 35,
    category: "time",
    title: "Board Game Night",
    desc: "We play your favorite game (I won’t get competitive).",
  },
  {
    id: 36,
    category: "time",
    title: "The Long Walk",
    desc: "A leisurely walk with no destination, just talking.",
  },
  {
    id: 37,
    category: "time",
    title: "Cooking Together",
    desc: "We make a new recipe together in the kitchen.",
  },
  {
    id: 38,
    category: "time",
    title: "Date Night (You Pick)",
    desc: "You pick the place; I pay and drive.",
  },
  {
    id: 39,
    category: "time",
    title: "Date Night (I Pick)",
    desc: "I plan a surprise date; you just show up.",
  },
  {
    id: 40,
    category: "time",
    title: "Coffee Shop Date",
    desc: "We sit, sip, and people-watch for an hour.",
  },
  {
    id: 41,
    category: "time",
    title: "Picnic in the Park",
    desc: "I pack the basket; we eat outside.",
  },
  {
    id: 42,
    category: "time",
    title: "Late Night Drive",
    desc: "Driving around listening to music with no traffic.",
  },
  {
    id: 43,
    category: "time",
    title: "Memory Lane",
    desc: "We look through old photos/videos of us together.",
  },
  {
    id: 44,
    category: "time",
    title: "Player 2",
    desc: "I play your favorite video game with you for an hour.",
  },
  {
    id: 45,
    category: "time",
    title: "Reading Party",
    desc: "We read our own books side-by-side in silence.",
  },
  {
    id: 46,
    category: "time",
    title: "Culture Trip",
    desc: "We visit a museum or art gallery together.",
  },
  {
    id: 47,
    category: "time",
    title: "Bath Chat",
    desc: "Bubble bath for two, or I keep you company while you soak.",
  },
  {
    id: 48,
    category: "time",
    title: "Question Night",
    desc: 'We ask each other "deep questions" to learn new things.',
  },
  {
    id: 49,
    category: "time",
    title: "Exercise Buddy",
    desc: "I join you for a workout, yoga, or run.",
  },
  {
    id: 50,
    category: "time",
    title: "Karaoke Night",
    desc: "At home or out—we sing a duet.",
  },
  {
    id: 51,
    category: "time",
    title: "DIY Project",
    desc: "We build or craft something together.",
  },
  {
    id: 52,
    category: "time",
    title: "Market Stroll",
    desc: "We walk through a farmer’s market or flea market.",
  },
  {
    id: 53,
    category: "time",
    title: "Living Room Fort",
    desc: "We build a blanket fort and hang out inside.",
  },
  {
    id: 54,
    category: "time",
    title: "Sunrise Date",
    desc: "We wake up early to catch the sunrise with coffee.",
  },
  {
    id: 55,
    category: "time",
    title: "Show Binge",
    desc: "We watch 3 episodes of that show you love.",
  },
  {
    id: 56,
    category: "time",
    title: "Dream Session",
    desc: "We spend an hour planning a future trip.",
  },
  {
    id: 57,
    category: "time",
    title: "Dance Lesson",
    desc: "We try to learn a dance move in the living room.",
  },
  {
    id: 58,
    category: "time",
    title: "Library Date",
    desc: "We go pick out books for each other.",
  },
  {
    id: 59,
    category: "time",
    title: "Puzzle Night",
    desc: "We work on a jigsaw puzzle together.",
  },
  {
    id: 60,
    category: "time",
    title: "Podcast Trip",
    desc: "We listen to an episode you pick together.",
  },

  // --- PHYSICAL TOUCH (30) ---
  {
    id: 61,
    category: "touch",
    title: "Full Body Massage",
    desc: "30 minutes, no complaints.",
  },
  {
    id: 62,
    category: "touch",
    title: "Foot Rub",
    desc: "15 minutes of foot relaxation after a long day.",
  },
  {
    id: 63,
    category: "touch",
    title: "Head Scratch",
    desc: "10 minutes of scalp massage/hair playing.",
  },
  {
    id: 64,
    category: "touch",
    title: "Hand Holding",
    desc: "I hold your hand during an entire car ride or movie.",
  },
  {
    id: 65,
    category: "touch",
    title: "The Big Spoon",
    desc: "We cuddle, and you get to be the little spoon.",
  },
  {
    id: 66,
    category: "touch",
    title: "The Little Spoon",
    desc: "We cuddle, and I’ll be the little spoon (backpack!).",
  },
  {
    id: 67,
    category: "touch",
    title: "Back Scratch",
    desc: "The good kind, right where it itches.",
  },
  {
    id: 68,
    category: "touch",
    title: "Neck & Shoulder Rub",
    desc: "Quick tension relief whenever you need it.",
  },
  {
    id: 69,
    category: "touch",
    title: "Hair Brushing",
    desc: "I gently brush or style your hair.",
  },
  {
    id: 70,
    category: "touch",
    title: "Face Massage",
    desc: "Gentle pressure points on the face/temples.",
  },
  {
    id: 71,
    category: "touch",
    title: "Leg Massage",
    desc: "Relief for tired legs.",
  },
  {
    id: 72,
    category: "touch",
    title: "Cuddle Session",
    desc: "20 minutes of uninterrupted cuddling (no phones).",
  },
  {
    id: 73,
    category: "touch",
    title: "Kisses on Demand",
    desc: "One immediate, long kiss.",
  },
  {
    id: 74,
    category: "touch",
    title: "Morning Snuggle",
    desc: "10 extra minutes in bed just holding each other.",
  },
  {
    id: 75,
    category: "touch",
    title: "Greeting Hug",
    desc: "A long, two-arm hug as soon as I see you.",
  },
  {
    id: 76,
    category: "touch",
    title: "Hand Massage",
    desc: "Hand relaxation with lotion or oil.",
  },
  {
    id: 77,
    category: "touch",
    title: "Lotion Helper",
    desc: "I help apply lotion to your back/hard-to-reach spots.",
  },
  {
    id: 78,
    category: "touch",
    title: "Nap Buddy",
    desc: "We take a nap together, tangled up.",
  },
  {
    id: 79,
    category: "touch",
    title: "Lap Pillow",
    desc: "You lay your head in my lap while I play with your hair.",
  },
  {
    id: 80,
    category: "touch",
    title: "Bear Hug",
    desc: "A squeeze-the-air-out-of-you hug.",
  },
  {
    id: 81,
    category: "touch",
    title: "Forehead Kisses",
    desc: "A coupon for 5 forehead kisses in a row.",
  },
  {
    id: 82,
    category: "touch",
    title: "Pinky Promise",
    desc: "A moment of holding pinkies and making a wish.",
  },
  {
    id: 83,
    category: "touch",
    title: "Steamy Makeout",
    desc: "Like we just started dating again.",
  },
  {
    id: 84,
    category: "touch",
    title: "Shower Together",
    desc: "I’ll wash your back.",
  },
  {
    id: 85,
    category: "touch",
    title: "Sleepy Carry",
    desc: "I carry you to bed (or at least to the couch).",
  },
  {
    id: 86,
    category: "touch",
    title: "Slow Dance",
    desc: "We dance in the kitchen, holding each other close.",
  },
  {
    id: 87,
    category: "touch",
    title: "Cheek Kisses",
    desc: "An attack of kisses all over your face.",
  },
  {
    id: 88,
    category: "touch",
    title: "Hand Warmer",
    desc: "I hold your cold hands in my warm ones.",
  },
  {
    id: 89,
    category: "touch",
    title: "Neck Kisses",
    desc: "Soft kisses on your neck and shoulder.",
  },
  {
    id: 90,
    category: "touch",
    title: "Anywhere Scratch",
    desc: "You point to the itch, I scratch it.",
  },

  // --- RECEIVING GIFTS (10) ---
  {
    id: 91,
    category: "gift",
    title: "Sweet Treat",
    desc: "I bring home your favorite candy or chocolate.",
  },
  {
    id: 92,
    category: "gift",
    title: "Flower Power",
    desc: "Fresh flowers, just because.",
  },
  {
    id: 93,
    category: "gift",
    title: "Wishlist Grant",
    desc: "One item from your wishlist (under $20).",
  },
  {
    id: 94,
    category: "gift",
    title: "Love Letter",
    desc: "A handwritten letter, sealed and delivered.",
  },
  {
    id: 95,
    category: "gift",
    title: "Surprise Lunch",
    desc: "I order lunch to be delivered to you.",
  },
  {
    id: 96,
    category: "gift",
    title: "Bookstore Buy",
    desc: "I buy you a book or magazine of your choice.",
  },
  {
    id: 97,
    category: "gift",
    title: 'The "Little Thing"',
    desc: "We buy that small thing you have been eyeing.",
  },
  {
    id: 98,
    category: "gift",
    title: "Digital Goodie",
    desc: "An app, game, or movie rental on me.",
  },
  {
    id: 99,
    category: "gift",
    title: "Framed Memory",
    desc: "I print and frame a photo of us.",
  },
  {
    id: 100,
    category: "gift",
    title: "Curated Playlist",
    desc: "A custom mixtape/playlist made just for you.",
  },
];

const ValentineCoupons = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<any>(null);

  // Login State
  const [authMode, setAuthMode] = useState<any>(null);
  const [pinInput, setPinInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [showChangePin, setShowChangePin] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Config State
  const [appConfig, setAppConfig] = useState<any>({});

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [redeemedData, setRedeemedData] = useState<any>({});
  const [showModal, setShowModal] = useState<any>(null);

  // --- 1. AUTH & INIT ---
  useEffect(() => {
    // If not configured, we don't try to auth
    if (!isConfigured) return;

    const initAuth = async () => {
      try {
        await signInAnonymously(auth);

        // Check Persistent Login
        const savedRole = localStorage.getItem("valentine_app_role");
        if (savedRole) {
          setRole(savedRole);
        }
      } catch (err) {
        console.error("Auth Init Error:", err);
      }
    };
    initAuth();

    // Only listen for auth changes if auth object exists
    if (auth) {
      return onAuthStateChanged(auth, (u) => setUser(u));
    }
  }, []);

  // --- 2. FIRESTORE SYNC ---
  useEffect(() => {
    if (!user || !isConfigured) return;

    // Sync Coupons
    const couponsRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "coupons"
    );
    const unsubCoupons = onSnapshot(couponsRef, (snapshot) => {
      const data: any = {};
      snapshot.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      setRedeemedData(data);
    });

    // Sync Config (PINs)
    const configRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "config",
      "main"
    );
    const unsubConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        setAppConfig(docSnap.data());
      } else {
        setAppConfig({});
      }
    });

    return () => {
      unsubCoupons();
      unsubConfig();
    };
  }, [user]);

  // --- MAIN: CONFIGURATION CHECK SCREEN ---
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6 text-center font-sans text-slate-800">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
          <div className="mx-auto bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Configuration Required</h2>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            This app is almost ready! To make it work on your phones, you need
            to add your own Database Keys.
          </p>

          <div className="text-left bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs mb-6">
            <p className="font-bold mb-2">Steps to fix:</p>
            <ol className="list-decimal pl-4 space-y-1 text-slate-500">
              <li>
                Open <code>ProductionCoupons.tsx</code>
              </li>
              <li>Scroll to the top (lines 9-16)</li>
              <li>
                Replace the <code>firebaseConfig</code> values with your keys
                from the Firebase Console.
              </li>
            </ol>
          </div>

          <div className="inline-block bg-slate-800 text-white text-xs px-3 py-1 rounded-full opacity-50">
            Status: Placeholder Keys Detected
          </div>
        </div>
      </div>
    );
  }

  // --- 3. ACTIONS ---

  const handleLogin = async (targetRole: string) => {
    const pinKey = targetRole === "giver" ? "boyfriendPin" : "girlfriendPin";
    const storedPin = appConfig[pinKey];

    if (!storedPin) {
      if (pinInput.length !== 4) {
        setAuthError("PIN must be 4 digits.");
        return;
      }
      try {
        // Save new PIN
        const configRef = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "config",
          "main"
        );
        await setDoc(configRef, { [pinKey]: pinInput }, { merge: true });

        // Log in
        setRole(targetRole);
        localStorage.setItem("valentine_app_role", targetRole);
        setAuthMode(null);
        setPinInput("");
      } catch (err) {
        console.error("Error setting pin:", err);
        setAuthError("Could not save PIN. Network error?");
      }
    } else {
      if (pinInput === storedPin) {
        setRole(targetRole);
        localStorage.setItem("valentine_app_role", targetRole);
        setAuthMode(null);
        setPinInput("");
        setAuthError("");
      } else {
        setAuthError("Incorrect PIN. Try again!");
        setPinInput("");
      }
    }
  };

  const handleChangePin = async () => {
    if (pinInput.length !== 4) {
      setAuthError("PIN must be 4 digits.");
      return;
    }
    const pinKey = role === "giver" ? "boyfriendPin" : "girlfriendPin";
    const configRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "config",
      "main"
    );
    await setDoc(configRef, { [pinKey]: pinInput }, { merge: true });

    setShowChangePin(false);
    setPinInput("");
  };

  const handleLogoutClick = () => setShowLogoutModal(true);

  const confirmLogout = () => {
    localStorage.removeItem("valentine_app_role");
    setRole(null);
    setFilter("all");
    setShowLogoutModal(false);
  };

  const handleRedeem = async (coupon: any) => {
    if (!user) return;
    const docRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "coupons",
      coupon.id.toString()
    );
    await setDoc(docRef, {
      redeemed: true,
      redeemedAt: serverTimestamp(),
      title: coupon.title,
      honorStatus: "pending",
    });

    const text = `Hey! I just redeemed my coupon for: ${coupon.title} ❤️`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Love Coupon Redeemed!", text: text });
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    }

    setShowModal(null);
  };

  const handleStatusUpdate = async (id: number, status: string, e: any) => {
    e.stopPropagation();
    if (!user) return;
    const docRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "coupons",
      id.toString()
    );
    await setDoc(docRef, { honorStatus: status }, { merge: true });
  };

  const handleReset = async (id: number) => {
    if (!user) return;
    const docRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "coupons",
      id.toString()
    );
    await deleteDoc(docRef);
  };

  // --- 4. RENDER HELPERS ---

  const getIcon = (cat: string) => {
    switch (cat) {
      case "service":
        return <HandHelping className="w-6 h-6 text-blue-500" />;
      case "time":
        return <Clock className="w-6 h-6 text-purple-500" />;
      case "touch":
        return <Heart className="w-6 h-6 text-red-500 fill-current" />;
      case "gift":
        return <Gift className="w-6 h-6 text-teal-600" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  const getColorClass = (
    cat: string,
    isRedeemed: boolean,
    honorStatus: any
  ) => {
    if (isRedeemed) {
      if (honorStatus === "honored")
        return "bg-green-50 border-green-200 text-green-800 opacity-80";
      if (honorStatus === "dishonored")
        return "bg-red-50 border-red-200 text-red-800 opacity-80";
      return "bg-gray-100 border-gray-200 text-gray-500";
    }

    switch (cat) {
      case "service":
        return "border-blue-200 bg-blue-50 text-blue-800";
      case "time":
        return "border-purple-200 bg-purple-50 text-purple-800";
      case "touch":
        return "border-red-200 bg-red-50 text-red-800";
      case "gift":
        return "border-teal-200 bg-teal-50 text-teal-800";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  // --- 5. MAIN VIEWS ---

  if (!role) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* LOGIN SCREEN: SELECT ROLE or ENTER PIN */}
          {authMode ? (
            <div className="animate-in fade-in zoom-in duration-300">
              <button
                onClick={() => {
                  setAuthMode(null);
                  setAuthError("");
                  setPinInput("");
                }}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-600"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  authMode === "giver" ? "bg-blue-100" : "bg-red-100"
                }`}
              >
                <Lock
                  className={`w-8 h-8 ${
                    authMode === "giver" ? "text-blue-600" : "text-red-600"
                  }`}
                />
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                {appConfig[
                  authMode === "giver" ? "boyfriendPin" : "girlfriendPin"
                ]
                  ? `Enter ${
                      authMode === "giver" ? "Boyfriend" : "Girlfriend"
                    } PIN`
                  : `Create ${
                      authMode === "giver" ? "Boyfriend" : "Girlfriend"
                    } PIN`}
              </h2>

              <p className="text-slate-500 text-sm mb-6">
                {appConfig[
                  authMode === "giver" ? "boyfriendPin" : "girlfriendPin"
                ]
                  ? "Security check to access your coupons."
                  : "First time setup: Create a 4-digit code."}
              </p>

              <input
                type="tel" // triggers numeric keypad on mobile
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="0000"
                className="w-32 text-center text-3xl font-bold tracking-widest border-b-2 border-slate-300 focus:border-red-500 outline-none pb-2 mb-6 bg-transparent"
              />

              {authError && (
                <p className="text-red-500 text-sm mb-4 font-bold">
                  {authError}
                </p>
              )}

              <button
                onClick={() => handleLogin(authMode)}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-transform active:scale-95 ${
                  authMode === "giver"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {appConfig[
                  authMode === "giver" ? "boyfriendPin" : "girlfriendPin"
                ]
                  ? "Unlock"
                  : "Save PIN"}
              </button>
            </div>
          ) : (
            <>
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Who are you?
              </h1>
              <p className="text-slate-500 mb-8">
                Select your role to continue
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setAuthMode("receiver")}
                  className="w-full py-4 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-lg shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Heart className="fill-white" />I am the Girlfriend
                  <span className="text-xs font-normal opacity-80 block ml-2">
                    (Redeem)
                  </span>
                </button>

                <button
                  onClick={() => setAuthMode("giver")}
                  className="w-full py-4 px-6 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Gift />I am the Boyfriend
                  <span className="text-xs font-normal opacity-60 block ml-2">
                    (Track)
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- FILTER & DATA PREP ---
  const processedCoupons = ALL_COUPONS.map((c) => ({
    ...c,
    isRedeemed: !!redeemedData[c.id],
    redeemedAt: redeemedData[c.id]?.redeemedAt,
    honorStatus:
      redeemedData[c.id]?.honorStatus ||
      (!!redeemedData[c.id] ? "pending" : null),
  }));

  // Render logic variable
  let content: any = null;

  // SPECIAL GIVER REDEEMED VIEW (The "Piles" View)
  if (role === "giver" && filter === "redeemed") {
    const redeemedList = processedCoupons.filter((c) => c.isRedeemed);
    const pending = redeemedList.filter((c) => c.honorStatus === "pending");
    const honored = redeemedList.filter((c) => c.honorStatus === "honored");
    const dishonored = redeemedList.filter(
      (c) => c.honorStatus === "dishonored"
    );

    const renderCard = (coupon: any, showActions: boolean) => (
      <div
        key={coupon.id}
        className={`border rounded-lg p-4 mb-3 ${getColorClass(
          coupon.category,
          true,
          coupon.honorStatus
        )}`}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-sm">{coupon.title}</h3>
          {coupon.honorStatus === "honored" && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {coupon.honorStatus === "dishonored" && (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
        <p className="text-xs mt-1 opacity-80">{coupon.desc}</p>

        {showActions && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-black/5">
            <button
              onClick={(e) => handleStatusUpdate(coupon.id, "honored", e)}
              className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1"
            >
              <ThumbsUp className="w-3 h-3" /> Honor
            </button>
            <button
              onClick={(e) => handleStatusUpdate(coupon.id, "dishonored", e)}
              className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1"
            >
              <ThumbsDown className="w-3 h-3" /> Reject
            </button>
          </div>
        )}
        {!showActions && (
          <div className="mt-2 text-right">
            <button
              onClick={(e) => handleStatusUpdate(coupon.id, "pending", e)}
              className="text-[10px] underline opacity-50"
            >
              Change Status
            </button>
          </div>
        )}
      </div>
    );

    content = (
      <div className="space-y-8 pb-12">
        {/* Pile 1: Action Required */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
              Action Required
            </span>
            Pending Review ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No new redemptions pending.
            </p>
          ) : (
            pending.map((c) => renderCard(c, true))
          )}
        </section>

        {/* Pile 2: Honored */}
        <section className="opacity-90">
          <h2 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Coupon Honored ({honored.length}
            )
          </h2>
          {honored.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No coupons honored yet.
            </p>
          ) : (
            honored.map((c) => renderCard(c, false))
          )}
        </section>

        {/* Pile 3: Not Honored */}
        <section className="opacity-90">
          <h2 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5" /> Coupon Not Honored (
            {dishonored.length})
          </h2>
          {dishonored.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No coupons rejected.
            </p>
          ) : (
            dishonored.map((c) => renderCard(c, false))
          )}
        </section>
      </div>
    );
  } else {
    // STANDARD VIEW (Grid)
    let filtered =
      filter === "all"
        ? processedCoupons
        : filter === "redeemed"
        ? processedCoupons.filter((c) => c.isRedeemed)
        : processedCoupons.filter((c) => c.category === filter);

    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(lowerTerm) ||
          c.desc.toLowerCase().includes(lowerTerm)
      );
    }

    // Sort: Active first for receiver, Redeemed first for giver
    const activeCoupons = filtered.filter((c) => !c.isRedeemed);
    const redeemedList = filtered.filter((c) => c.isRedeemed);
    const displayList =
      role === "receiver"
        ? [...activeCoupons, ...redeemedList]
        : [...redeemedList, ...activeCoupons];

    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayList.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            <p>No coupons found!</p>
          </div>
        )}
        {displayList.map((coupon) => (
          <div
            key={coupon.id}
            onClick={() => {
              if (role === "receiver" && !coupon.isRedeemed)
                setShowModal(coupon);
            }}
            className={`
              relative overflow-hidden border-2 rounded-xl p-5 flex flex-col text-left transition-all duration-200
              ${
                role === "receiver" && !coupon.isRedeemed
                  ? "cursor-pointer hover:shadow-md active:scale-[0.98]"
                  : ""
              }
              ${getColorClass(
                coupon.category,
                coupon.isRedeemed,
                coupon.honorStatus
              )}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <div
                className={`p-2 rounded-full ${
                  coupon.isRedeemed ? "bg-white/50" : "bg-white shadow-sm"
                }`}
              >
                {getIcon(coupon.category)}
              </div>
              {coupon.isRedeemed && (
                <div className="flex flex-col items-end">
                  <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase mb-1">
                    Redeemed
                  </span>
                  {coupon.honorStatus === "honored" && (
                    <span className="text-green-600 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Honored
                    </span>
                  )}
                  {coupon.honorStatus === "dishonored" && (
                    <span className="text-red-600 text-[10px] font-bold flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Not Honored
                    </span>
                  )}
                </div>
              )}
            </div>
            <h3
              className={`font-bold text-lg leading-tight mb-1 ${
                coupon.isRedeemed ? "line-through" : ""
              }`}
            >
              {coupon.title}
            </h3>
            <p className="text-sm opacity-90 font-medium leading-snug">
              {coupon.desc}
            </p>

            {/* Standard Reactivate Button for Giver (Only visible if not in the special Redeemed view) */}
            {role === "giver" && coupon.isRedeemed && filter !== "redeemed" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset(coupon.id);
                }}
                className="mt-4 w-full py-2 bg-white/50 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-red-600 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3 h-3" /> Reactivate Coupon
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 text-slate-800 pb-20 font-sans">
      <div className="bg-white shadow-sm border-b border-pink-100 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-red-600 flex items-center gap-2">
                <Sparkles className="text-yellow-400 w-5 h-5" /> Love Coupons
              </h1>
              <p className="text-xs text-slate-400">
                {role === "receiver" ? "Tap to redeem!" : "Tracking Dashboard"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {/* SETTINGS BUTTON */}
              <button
                onClick={() => setShowChangePin(true)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                title="Change PIN"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* LOG OUT BUTTON */}
              <button
                onClick={handleLogoutClick}
                className="text-slate-400 hover:text-red-600 transition-colors p-2"
                title="Log Out / Switch User"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white sm:text-sm"
            />
          </div>
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {["all", "service", "time", "touch", "gift", "redeemed"].map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                      filter === f
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">{content}</div>

      {/* MODAL: CHANGE PIN */}
      {showChangePin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setShowChangePin(false);
                setPinInput("");
                setAuthError("");
              }}
              className="absolute top-4 right-4 text-slate-400"
            >
              <XCircle />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Update Security PIN
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Enter a new 4-digit code for your account.
            </p>

            <input
              type="tel"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="0000"
              className="w-full text-center text-3xl font-bold tracking-widest border-b-2 border-slate-300 focus:border-red-500 outline-none pb-2 mb-6 bg-transparent"
            />
            {authError && (
              <p className="text-red-500 text-sm mb-4 font-bold text-center">
                {authError}
              </p>
            )}

            <button
              onClick={handleChangePin}
              className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" /> Save New PIN
            </button>
          </div>
        </div>
      )}

      {/* MODAL: REDEEM CONFIRM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all scale-100">
            <div
              className={`h-24 flex items-center justify-center ${
                getColorClass(showModal.category, false, null).split(" ")[1]
              }`}
            >
              <Gift className="w-12 h-12 opacity-50" />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Redeem this?
              </h3>
              <p className="text-slate-600 mb-6">
                Are you ready to use <strong>"{showModal.title}"</strong>?<br />
                <span className="text-xs text-slate-400 mt-2 block">
                  (This will notify him immediately!)
                </span>
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleRedeem(showModal)}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" /> Redeem & Notify
                </button>
                <button
                  onClick={() => setShowModal(null)}
                  className="w-full py-3 bg-white text-slate-500 font-medium rounded-xl hover:bg-slate-50"
                >
                  Cancel, save for later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOGOUT CONFIRM */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 relative">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Log Out?</h3>
            <p className="text-sm text-slate-600 mb-6">
              You will need to re-enter your PIN to access this profile again.
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValentineCoupons;
