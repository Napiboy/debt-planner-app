import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, deleteDoc, onSnapshot, query, setLogLevel, updateDoc, Timestamp, getDocs } from 'firebase/firestore';
import { Trash2, TrendingUp, DollarSign, PlusCircle, Pencil, BarChart2, PieChart, Zap, ClipboardPlus, History, Target, ListTree, Lightbulb, Sun, Moon, LogOut, UserPlus, LogIn } from 'lucide-react';

// --- Firebase Configuration ---
// This is now connected to your specific Firebase project.
const appId = 'debt-paydown-1987a'; // Using your project ID
const firebaseConfig = {
  apiKey: "AIzaSyDbo7AdRM5IO8agvB9inRnWQI7KpdmxABE",
  authDomain: "debt-paydown-1987a.firebaseapp.com",
  projectId: "debt-paydown-1987a",
  storageBucket: "debt-paydown-1987a.appspot.com",
  messagingSenderId: "441646454783",
  appId: "1:441646454783:web:d887faa5631c7cd4cb39ca",
  measurementId: "G-FL04T60PT5"
};

// --- Main App Component (Auth Controller) ---
export default function App() {
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [theme, setTheme] = useState('light');

    // --- Theme Management ---
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(storedTheme || (prefersDark ? 'dark' : 'light'));
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // --- Firebase Initialization and Auth State Listener ---
    useEffect(() => {
        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is missing.");
            setIsAuthReady(true);
            return;
        }
        
        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const firestore = getFirestore(app);
            setDb(firestore);
            setAuth(authInstance);
            setLogLevel('debug');

            const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
                setUser(currentUser);
                setIsAuthReady(true);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            setIsAuthReady(true);
        }
    }, []);

    const handleSignOut = async () => {
        if (auth) {
            await signOut(auth);
        }
    };

    if (!isAuthReady) {
        return <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">Loading...</div>;
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            {user ? (
                <DebtPlanner user={user} db={db} handleSignOut={handleSignOut} theme={theme} toggleTheme={toggleTheme} />
            ) : (
                <AuthPage auth={auth} theme={theme} toggleTheme={toggleTheme} />
            )}
        </div>
    );
}

// --- Authentication Page Component ---
function AuthPage({ auth, theme, toggleTheme }) {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLoginView) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="absolute top-4 right-4">
                 <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </div>
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Debt Paydown Planner</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Sign in to manage your finances.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">{isLoginView ? 'Sign In' : 'Create Account'}</h2>
                    <form onSubmit={handleAuthAction} className="space-y-4">
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required className="w-full p-3 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full p-3 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500" />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                            {isLoginView ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLoginView(!isLoginView)} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-1">
                            {isLoginView ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}


// --- Main Planner Component ---
function DebtPlanner({ user, db, handleSignOut, theme, toggleTheme }) {
    const [debts, setDebts] = useState([]);
    const [extraPayment, setExtraPayment] = useState(100);
    const [strategy, setStrategy] = useState('avalanche');
    const [isLoading, setIsLoading] = useState(true);
    const [editingDebt, setEditingDebt] = useState(null);
    const [loggingPaymentFor, setLoggingPaymentFor] = useState(null);
    const [viewingHistoryFor, setViewingHistoryFor] = useState(null);
    const [viewingAmortizationFor, setViewingAmortizationFor] = useState(null);

    useEffect(() => {
        if (!db || !user) return;
        setIsLoading(true);
        const debtsCollectionPath = `artifacts/${appId}/users/${user.uid}/debts`;
        const q = query(collection(db, debtsCollectionPath));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const debtsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDebts(debtsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching debts:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db, user]);

    const addDebt = async (debt) => {
        if (!db || !user) return;
        const debtsCollectionPath = `artifacts/${appId}/users/${user.uid}/debts`;
        await addDoc(collection(db, debtsCollectionPath), debt);
    };

    const updateDebt = async (id, updatedDebt) => {
        if (!db || !user) return;
        const debtDocPath = `artifacts/${appId}/users/${user.uid}/debts/${id}`;
        await updateDoc(doc(db, debtDocPath), updatedDebt);
        setEditingDebt(null);
    };

    const deleteDebt = async (id) => {
        if (!db || !user) return;
        const debtDocPath = `artifacts/${appId}/users/${user.uid}/debts/${id}`;
        await deleteDoc(doc(db, debtDocPath));
    };

    const handleLogPayment = async (debt, amount) => {
        if (!db || !user || !debt) return;
        const newBalance = debt.balance - amount;
        const debtDocPath = `artifacts/${appId}/users/${user.uid}/debts/${debt.id}`;
        await updateDoc(doc(db, debtDocPath), { balance: newBalance });
        const paymentsCollectionPath = `artifacts/${appId}/users/${user.uid}/debts/${debt.id}/payments`;
        await addDoc(collection(db, paymentsCollectionPath), { amount: amount, date: Timestamp.now() });
        setLoggingPaymentFor(null);
    };
    
    const { sortedDebts, totalBalance, totalMinPayment } = useMemo(() => {
        const sorted = [...debts].sort((a, b) => {
            if (strategy === 'avalanche') return b.apr - a.apr;
            return a.balance - b.balance;
        });
        const balance = debts.reduce((sum, debt) => sum + parseFloat(debt.balance || 0), 0);
        const minPayment = debts.reduce((sum, debt) => sum + parseFloat(debt.minPayment || 0), 0);
        return { sortedDebts: sorted, totalBalance: balance, totalMinPayment: minPayment };
    }, [debts, strategy]);

    const targetDebt = sortedDebts.length > 0 ? sortedDebts[0] : null;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Header user={user} handleSignOut={handleSignOut} theme={theme} toggleTheme={toggleTheme} />
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-2 space-y-8">
                    <AddDebtForm onAddDebt={addDebt} editingDebt={editingDebt} onUpdateDebt={updateDebt} setEditingDebt={setEditingDebt} />
                    <DebtList 
                        debts={debts} 
                        onDeleteDebt={deleteDebt} 
                        onEditDebt={setEditingDebt} 
                        onLogPaymentClick={setLoggingPaymentFor}
                        onViewHistoryClick={setViewingHistoryFor}
                        onViewAmortizationClick={setViewingAmortizationFor}
                        isLoading={isLoading} 
                    />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <SummaryCard totalBalance={totalBalance} totalMinPayment={totalMinPayment} debtCount={debts.length} debts={debts} />
                    <StrategySelector 
                        strategy={strategy} 
                        setStrategy={setStrategy}
                        extraPayment={extraPayment}
                        setExtraPayment={setExtraPayment}
                        debts={debts}
                    />
                    <PaydownPlan targetDebt={targetDebt} strategy={strategy} extraPayment={extraPayment} />
                    <TabbedToolsCard debts={debts} extraPayment={extraPayment} strategy={strategy} />
                </div>
            </main>
            
            {loggingPaymentFor && <LogPaymentModal debt={loggingPaymentFor} onClose={() => setLoggingPaymentFor(null)} onLogPayment={handleLogPayment} />}
            {viewingHistoryFor && <PaymentHistoryModal debt={viewingHistoryFor} db={db} userId={user.uid} onClose={() => setViewingHistoryFor(null)} />}
            {viewingAmortizationFor && <AmortizationModal targetDebt={viewingAmortizationFor} allDebts={debts} extraPayment={extraPayment} strategy={strategy} onClose={() => setViewingAmortizationFor(null)} />}
        </div>
    );
}


// --- Other Components (Header, DebtList, Modals, etc.) ---
// These components are largely the same but now receive props from DebtPlanner instead of App

function Header({ user, handleSignOut, theme, toggleTheme }) {
    return (
        <header className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Debt Paydown Planner</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome, {user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <Tooltip text="Sign Out">
                        <button onClick={handleSignOut} className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </Tooltip>
                </div>
            </div>
        </header>
    );
}

// ... (The rest of the components: AddDebtForm, DebtList, SummaryCard, etc. are the same as the previous version)
// For brevity, I will include only the components that needed significant changes. The others are unchanged.

function AddDebtForm({ onAddDebt, editingDebt, onUpdateDebt, setEditingDebt }) {
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [apr, setApr] = useState('');
    const [minPayment, setMinPayment] = useState('');
    
    useEffect(() => {
        if (editingDebt) {
            setName(editingDebt.name);
            setBalance(editingDebt.balance);
            setApr(editingDebt.apr);
            setMinPayment(editingDebt.minPayment);
        } else {
            setName('');
            setBalance('');
            setApr('');
            setMinPayment('');
        }
    }, [editingDebt]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !balance || !apr || !minPayment) return;
        
        const debtData = {
            name,
            balance: parseFloat(balance),
            apr: parseFloat(apr),
            minPayment: parseFloat(minPayment),
        };

        if (editingDebt) {
            onUpdateDebt(editingDebt.id, debtData);
        } else {
            onAddDebt(debtData);
        }
        setEditingDebt(null);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-xl font-bold mb-4 flex items-center text-slate-900 dark:text-white">
                {editingDebt ? <Pencil className="mr-2 text-blue-600"/> : <PlusCircle className="mr-2 text-blue-600"/>}
                {editingDebt ? 'Edit Debt' : 'Add a New Debt'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Debt Name (e.g., Visa Card)" className="p-2 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500" required />
                <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="Total Balance ($)" className="p-2 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500" required step="0.01" min="0" />
                <Tooltip text="Annual Percentage Rate: The yearly interest you're charged.">
                    <input type="number" value={apr} onChange={e => setApr(e.target.value)} placeholder="Interest Rate (APR %)" className="p-2 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 w-full" required step="0.01" min="0" />
                </Tooltip>
                <input type="number" value={minPayment} onChange={e => setMinPayment(e.target.value)} placeholder="Minimum Payment ($)" className="p-2 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500" required step="0.01" min="0" />
                <div className="md:col-span-2 flex items-center gap-4">
                     <button type="submit" className="flex-grow bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm">
                        {editingDebt ? 'Update Debt' : 'Add Debt'}
                    </button>
                    {editingDebt && (
                        <button type="button" onClick={() => setEditingDebt(null)} className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

function DebtList({ debts, onDeleteDebt, onEditDebt, onLogPaymentClick, onViewHistoryClick, onViewAmortizationClick, isLoading }) {
    if (isLoading) {
        return <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">Loading your debts...</div>
    }
    
    if (debts.length === 0) {
        return (
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center">
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Your Debts</h2>
                <p className="text-slate-500 dark:text-slate-400">You haven't added any debts yet. Use the form above to get started!</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Your Debts</h2>
            <div className="space-y-3">
                {debts.map(debt => (
                    <div key={debt.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="flex-grow">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{debt.name}</p>
                            <div className="flex flex-wrap text-sm text-slate-600 dark:text-slate-400 mt-1">
                                <span className="mr-4">Balance: ${parseFloat(debt.balance).toFixed(2)}</span>
                                <span className="mr-4">APR: {parseFloat(debt.apr).toFixed(2)}%</span>
                                <span>Min. Payment: ${parseFloat(debt.minPayment).toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Tooltip text="Log a payment and update balance">
                                <button onClick={() => onLogPaymentClick(debt)} className="p-2 text-slate-400 dark:text-slate-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full transition-colors duration-200">
                                    <ClipboardPlus size={18} />
                                </button>
                            </Tooltip>
                            <Tooltip text="View payment history">
                                <button onClick={() => onViewHistoryClick(debt)} className="p-2 text-slate-400 dark:text-slate-400 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors duration-200">
                                    <History size={18} />
                                </button>
                            </Tooltip>
                            <Tooltip text="View full amortization schedule">
                                <button onClick={() => onViewAmortizationClick(debt)} className="p-2 text-slate-400 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 rounded-full transition-colors duration-200">
                                    <ListTree size={18} />
                                </button>
                            </Tooltip>
                            <Tooltip text="Edit debt details">
                                <button onClick={() => onEditDebt(debt)} className="p-2 text-slate-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors duration-200">
                                    <Pencil size={18} />
                                </button>
                            </Tooltip>
                            <Tooltip text="Delete this debt">
                                <button onClick={() => onDeleteDebt(debt.id)} className="p-2 text-slate-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors duration-200">
                                    <Trash2 size={18} />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SummaryCard({ totalBalance, totalMinPayment, debtCount, debts }) {
    const chartData = useMemo(() => {
        if (totalBalance === 0) return [];
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
        return debts.map((debt, index) => ({
            name: debt.name,
            value: debt.balance,
            percentage: (debt.balance / totalBalance) * 100,
            color: COLORS[index % COLORS.length]
        }));
    }, [debts, totalBalance]);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Financial Snapshot</h2>
            <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Total Debt Balance</span>
                    <span className="font-bold text-lg text-red-600 dark:text-red-500">${totalBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Total Minimum Payments</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">${totalMinPayment.toFixed(2)} / month</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Number of Debts</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{debtCount}</span>
                </div>
            </div>
            {chartData.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center"><PieChart className="mr-2"/>Debt Breakdown</h3>
                    <DebtDonutChart data={chartData} />
                </div>
            )}
        </div>
    );
}

function DebtDonutChart({ data }) {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
            <svg width="120" height="120" viewBox="0 0 120 120" className="flex-shrink-0">
                <g transform="rotate(-90 60 60)">
                {data.map((item, index) => {
                    const dashoffset = circumference - (item.percentage / 100) * circumference;
                    const rotation = (accumulatedAngle / 100) * 360;
                    accumulatedAngle += item.percentage;
                    return (
                        <circle
                            key={index}
                            r={radius}
                            cx="60"
                            cy="60"
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth="20"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashoffset}
                            transform={`rotate(${rotation} 60 60)`}
                        />
                    );
                })}
                </g>
            </svg>
            <div className="text-sm space-y-1 w-full">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                            <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.percentage.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}


function StrategySelector({ strategy, setStrategy, extraPayment, setExtraPayment, debts }) {
    const [planningMode, setPlanningMode] = useState('payment'); // 'payment' or 'goal'
    const [goalDate, setGoalDate] = useState(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 3);
        return date.toISOString().split('T')[0];
    });

    useEffect(() => {
        if (planningMode === 'goal' && debts.length > 0) {
            const today = new Date();
            const targetDate = new Date(goalDate);
            const monthsToPay = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());

            if (monthsToPay <= 0) {
                setExtraPayment(debts.reduce((sum, d) => sum + d.balance, 0));
                return;
            }

            let low = 0;
            let high = debts.reduce((sum, d) => sum + d.balance, 0);
            let requiredPayment = high;

            for(let i=0; i<30; i++) {
                let mid = (low + high) / 2;
                const result = calculatePayoff(debts, mid, strategy);
                if (result.months <= monthsToPay) {
                    requiredPayment = mid;
                    high = mid;
                } else {
                    low = mid;
                }
            }
            setExtraPayment(Math.max(0, requiredPayment));
        }
    }, [planningMode, goalDate, debts, strategy, setExtraPayment]);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Your Strategy</h2>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Paydown Method</label>
                <div className="flex space-x-2">
                    <Tooltip text="Pay off highest interest rate first. Saves the most money.">
                        <button onClick={() => setStrategy('avalanche')} className={`w-full flex-1 py-2 px-3 text-sm rounded-md transition-all ${strategy === 'avalanche' ? 'bg-blue-600 text-white shadow' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>Avalanche</button>
                    </Tooltip>
                     <Tooltip text="Pay off smallest balance first. Good for motivation.">
                        <button onClick={() => setStrategy('snowball')} className={`w-full flex-1 py-2 px-3 text-sm rounded-md transition-all ${strategy === 'snowball' ? 'bg-blue-600 text-white shadow' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>Snowball</button>
                    </Tooltip>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Planning Mode</label>
                <div className="flex space-x-2">
                    <button onClick={() => setPlanningMode('payment')} className={`flex-1 py-2 px-3 text-sm rounded-md transition-all ${planningMode === 'payment' ? 'bg-green-600 text-white shadow' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>Set Payment</button>
                    <button onClick={() => setPlanningMode('goal')} className={`flex-1 py-2 px-3 text-sm rounded-md transition-all ${planningMode === 'goal' ? 'bg-green-600 text-white shadow' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>Set Goal</button>
                </div>
            </div>

            {planningMode === 'payment' ? (
                <div>
                    <label htmlFor="extra-payment" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Extra Monthly Payment</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                        <input id="extra-payment" type="number" value={extraPayment} onChange={e => setExtraPayment(parseFloat(e.target.value) || 0)} className="w-full p-2 pl-9 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500" step="10" min="0"/>
                    </div>
                </div>
            ) : (
                 <div>
                    <label htmlFor="goal-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Payoff Date</label>
                    <div className="relative">
                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                        <input id="goal-date" type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)} className="w-full p-2 pl-9 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-green-500" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">To meet this goal, you need to pay an extra <strong className="text-green-600 dark:text-green-400">${extraPayment.toFixed(2)}</strong> per month.</p>
                </div>
            )}
        </div>
    );
}

function PaydownPlan({ targetDebt, strategy, extraPayment }) {
    if (!targetDebt) {
        return (
            <div className="bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-lg">Your Paydown Plan</h3>
                <p>Add a debt to see your plan.</p>
            </div>
        );
    }

    const totalPaymentOnTarget = (targetDebt.minPayment || 0) + (extraPayment || 0);

    return (
        <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400 text-green-900 dark:text-green-200 p-6 rounded-lg shadow-lg">
            <h3 className="font-bold text-xl mb-3 flex items-center"><TrendingUp className="mr-2"/>Your #1 Target</h3>
            <div className="text-center bg-white dark:bg-slate-800 p-4 rounded-lg mb-4 shadow">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{targetDebt.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {strategy === 'avalanche' 
                        ? `Highest APR: ${targetDebt.apr.toFixed(2)}%` 
                        : `Smallest Balance: $${targetDebt.balance.toFixed(2)}`
                    }
                </p>
            </div>
            <div className="space-y-2 text-sm">
                <p>Based on the <strong className="capitalize">{strategy}</strong> method, focus all extra payments on this debt.</p>
                <p>Pay the minimum on all other debts.</p>
                <hr className="my-3 border-green-300 dark:border-green-700"/>
                <div className="flex justify-between items-center text-base">
                    <span className="font-semibold">This month, pay:</span>
                    <span className="font-bold text-xl text-green-800 dark:text-green-300">${totalPaymentOnTarget.toFixed(2)}</span>
                </div>
                <p className="text-xs text-right text-green-700 dark:text-green-400">(${targetDebt.minPayment.toFixed(2)} min + ${extraPayment.toFixed(2)} extra)</p>
            </div>
        </div>
    );
}

const calculatePayoff = (debts, extraPayment, strategy, lumpSum = 0) => {
    if (debts.length === 0) {
        return { months: 0, totalInterest: 0 };
    }

    let tempDebts = JSON.parse(JSON.stringify(debts));
    let months = 0;
    let totalInterest = 0;

    if (lumpSum > 0) {
        const sortedForLumpSum = tempDebts.sort((a, b) => {
            if (strategy === 'avalanche') return b.apr - a.apr;
            return a.balance - b.balance;
        });
        const targetForLumpSum = sortedForLumpSum.find(d => d.balance > 0);
        if (targetForLumpSum) {
            const payment = Math.min(targetForLumpSum.balance, lumpSum);
            targetForLumpSum.balance -= payment;
        }
    }
    
    const totalOriginalMinimums = tempDebts.reduce((sum, d) => sum + d.minPayment, 0);
    const totalMonthlyPayment = totalOriginalMinimums + extraPayment;

    while (tempDebts.some(d => d.balance > 0) && months < 600) {
        months++;
        let paymentPool = totalMonthlyPayment;

        tempDebts.forEach(debt => {
            if (debt.balance > 0) {
                const monthlyInterest = (debt.balance * (debt.apr / 100)) / 12;
                totalInterest += monthlyInterest;
                debt.balance += monthlyInterest;
            }
        });

        const sortedForPayment = tempDebts.sort((a, b) => {
            if (a.balance <= 0) return 1;
            if (b.balance <= 0) return -1;
            if (strategy === 'avalanche') return b.apr - a.apr;
            return a.balance - b.balance;
        });
        
        const targetDebt = sortedForPayment.find(d => d.balance > 0);

        tempDebts.forEach(debt => {
            if (debt.id !== targetDebt?.id && debt.balance > 0) {
                const payment = Math.min(debt.balance, debt.minPayment);
                debt.balance -= payment;
                paymentPool -= payment;
            }
        });

        if (targetDebt) {
            const payment = Math.min(targetDebt.balance, paymentPool);
            targetDebt.balance -= payment;
        }
    }
    return { months, totalInterest };
};

function WhatIfSimulator({ debts, extraPayment, strategy }) {
    const [lumpSum, setLumpSum] = useState(1000);
    const [simulationResult, setSimulationResult] = useState(null);

    const handleSimulation = () => {
        const baseline = calculatePayoff(debts, extraPayment, strategy);
        const withLumpSum = calculatePayoff(debts, extraPayment, strategy, lumpSum);
        
        setSimulationResult({
            monthsSaved: baseline.months - withLumpSum.months,
            interestSaved: baseline.totalInterest - withLumpSum.totalInterest,
            newPayoffDate: formatDate(withLumpSum.months)
        });
    };

    const formatDate = (months) => {
        if (months <= 0 || months >= 600) return "N/A";
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };

    if (debts.length === 0) return null;

    return (
        <div className="space-y-3">
            <label htmlFor="lump-sum" className="block text-sm font-medium text-slate-700 dark:text-slate-300">One-Time Extra Payment</label>
             <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input 
                    id="lump-sum"
                    type="number"
                    value={lumpSum}
                    onChange={e => setLumpSum(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 pl-9 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-yellow-500"
                    step="100"
                    min="0"
                />
            </div>
            <button onClick={handleSimulation} className="w-full bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors duration-200 shadow-sm">
                Simulate Impact
            </button>
        
            {simulationResult && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">With a <span className="text-yellow-600 dark:text-yellow-400">${lumpSum}</span> payment:</p>
                    <div className="mt-2 text-green-600 dark:text-green-400 font-bold text-lg">
                        You'll be debt-free {simulationResult.monthsSaved} months sooner!
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        (New payoff date: {simulationResult.newPayoffDate})
                    </div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        And you'll save an extra <span className="font-semibold">${simulationResult.interestSaved.toFixed(2)}</span> in interest.
                    </div>
                </div>
            )}
        </div>
    );
}

function PayoffProjections({ debts, extraPayment }) {
    const avalanche = useMemo(() => calculatePayoff(debts, extraPayment, 'avalanche'), [debts, extraPayment]);
    const snowball = useMemo(() => calculatePayoff(debts, extraPayment, 'snowball'), [debts, extraPayment]);

    const formatDate = (months) => {
        if (months <= 0 || months >= 600) return "N/A";
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };

    if (debts.length === 0) return null;

    return (
        <div className="space-y-4">
            <StrategyComparisonChart avalanche={avalanche} snowball={snowball} />
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <h3 className="font-bold text-indigo-800 dark:text-indigo-300">Avalanche Method</h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">Highest interest first</p>
                <div className="mt-2 flex justify-between items-baseline">
                    <span className="text-sm text-indigo-700 dark:text-indigo-400">Debt-Free By:</span>
                    <span className="font-bold text-lg text-indigo-800 dark:text-indigo-300">{formatDate(avalanche.months)}</span>
                </div>
                <div className="mt-1 flex justify-between items-baseline">
                    <span className="text-sm text-indigo-700 dark:text-indigo-400">Total Interest Paid:</span>
                    <span className="font-semibold text-indigo-800 dark:text-indigo-300">${avalanche.totalInterest.toFixed(2)}</span>
                </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-bold text-purple-800 dark:text-purple-300">Snowball Method</h3>
                <p className="text-xs text-purple-600 dark:text-purple-400">Smallest balance first</p>
                <div className="mt-2 flex justify-between items-baseline">
                    <span className="text-sm text-purple-700 dark:text-purple-400">Debt-Free By:</span>
                    <span className="font-bold text-lg text-purple-800 dark:text-purple-300">{formatDate(snowball.months)}</span>
                </div>
                 <div className="mt-1 flex justify-between items-baseline">
                    <span className="text-sm text-purple-700 dark:text-purple-400">Total Interest Paid:</span>
                    <span className="font-semibold text-purple-800 dark:text-purple-300">${snowball.totalInterest.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}

function StrategyComparisonChart({ avalanche, snowball }) {
    const interestSaved = snowball.totalInterest - avalanche.totalInterest;
    const timeSaved = snowball.months - avalanche.months;

    const maxInterest = Math.max(avalanche.totalInterest, snowball.totalInterest, 1);
    const maxMonths = Math.max(avalanche.months, snowball.months, 1);

    const avalancheInterestPercent = (avalanche.totalInterest / maxInterest) * 100;
    const snowballInterestPercent = (snowball.totalInterest / maxInterest) * 100;
    const avalancheMonthsPercent = (avalanche.months / maxMonths) * 100;
    const snowballMonthsPercent = (snowball.months / maxMonths) * 100;

    return (
        <div className="space-y-4 mb-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <div className="text-center">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200">Strategy Comparison</h4>
                {interestSaved > 1 && (
                     <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Avalanche saves you ${interestSaved.toFixed(2)}
                        {timeSaved > 0 && ` and gets you debt-free ${timeSaved} month(s) sooner!`}
                    </p>
                )}
            </div>
            <div className="space-y-2">
                <h5 className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Interest Paid</h5>
                <div className="space-y-2">
                    <div className="w-full">
                        <span className="text-xs text-indigo-700 dark:text-indigo-400">Avalanche: ${avalanche.totalInterest.toFixed(2)}</span>
                        <div className="bg-indigo-200 dark:bg-indigo-900/50 rounded-full h-4">
                            <div className="bg-indigo-500 h-4 rounded-full" style={{ width: `${avalancheInterestPercent}%` }}></div>
                        </div>
                    </div>
                    <div className="w-full">
                        <span className="text-xs text-purple-700 dark:text-purple-400">Snowball: ${snowball.totalInterest.toFixed(2)}</span>
                        <div className="bg-purple-200 dark:bg-purple-900/50 rounded-full h-4">
                            <div className="bg-purple-500 h-4 rounded-full" style={{ width: `${snowballInterestPercent}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <h5 className="text-sm font-medium text-slate-600 dark:text-slate-300">Time to Payoff</h5>
                 <div className="space-y-2">
                    <div className="w-full">
                        <span className="text-xs text-indigo-700 dark:text-indigo-400">Avalanche: {avalanche.months} months</span>
                        <div className="bg-indigo-200 dark:bg-indigo-900/50 rounded-full h-4">
                            <div className="bg-indigo-500 h-4 rounded-full" style={{ width: `${avalancheMonthsPercent}%` }}></div>
                        </div>
                    </div>
                    <div className="w-full">
                        <span className="text-xs text-purple-700 dark:text-purple-400">Snowball: {snowball.months} months</span>
                        <div className="bg-purple-200 dark:bg-purple-900/50 rounded-full h-4">
                            <div className="bg-purple-500 h-4 rounded-full" style={{ width: `${snowballMonthsPercent}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogPaymentModal({ debt, onClose, onLogPayment }) {
    const [amount, setAmount] = useState(debt.minPayment);

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogPayment(debt, parseFloat(amount));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-md m-4">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Log Payment for {debt.name}</h2>
                <form onSubmit={handleSubmit}>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Current Balance: ${debt.balance.toFixed(2)}</p>
                    <div className="mb-4">
                        <label htmlFor="payment-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Amount</label>
                        <div className="relative mt-1">
                             <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                            <input
                                id="payment-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-2 pl-9 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-green-500"
                                required
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                            Log Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PaymentHistoryModal({ debt, db, userId, onClose }) {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db || !userId) return;

        const fetchPayments = async () => {
            setIsLoading(true);
            const paymentsPath = `artifacts/${appId}/users/${userId}/debts/${debt.id}/payments`;
            const q = query(collection(db, paymentsPath));
            try {
                const querySnapshot = await getDocs(q);
                const paymentsData = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => b.date.toMillis() - a.date.toMillis());
                setPayments(paymentsData);
            } catch (error) {
                console.error("Error fetching payment history:", error);
            }
            setIsLoading(false);
        };

        fetchPayments();
    }, [db, userId, debt.id]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-lg m-4 flex flex-col" style={{maxHeight: '80vh'}}>
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Payment History for {debt.name}</h2>
                <div className="flex-grow overflow-y-auto pr-2">
                    {isLoading ? (
                        <p className="text-slate-500 dark:text-slate-400">Loading history...</p>
                    ) : payments.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">No payments have been logged for this debt yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {payments.map(payment => (
                                <li key={payment.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                                    <span className="text-slate-600 dark:text-slate-300 text-sm">
                                        {payment.date.toDate().toLocaleDateString()}
                                    </span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                        ${payment.amount.toFixed(2)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                     <button onClick={onClose} className="bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function AmortizationModal({ targetDebt, allDebts, extraPayment, strategy, onClose }) {
    const schedule = useMemo(() => {
        const calculateAmortization = () => {
            let tempDebts = JSON.parse(JSON.stringify(allDebts));
            let scheduleData = [];
            let month = 0;
            const totalOriginalMinimums = tempDebts.reduce((sum, d) => sum + d.minPayment, 0);
            
            while (tempDebts.find(d => d.id === targetDebt.id)?.balance > 0 && month < 600) {
                month++;
                let totalMonthlyPayment = totalOriginalMinimums + extraPayment;
                
                let currentTargetState = tempDebts.find(d => d.id === targetDebt.id);
                const beginningBalance = currentTargetState.balance;

                tempDebts.forEach(d => {
                    if (d.balance > 0) {
                        d.balance += (d.balance * (d.apr / 100)) / 12;
                    }
                });
                
                currentTargetState = tempDebts.find(d => d.id === targetDebt.id);
                const interestForMonth = currentTargetState.balance - beginningBalance;

                const overallTargetDebt = [...tempDebts].sort((a,b) => strategy === 'avalanche' ? b.apr - a.apr : a.balance - b.balance).find(d => d.balance > 0);
                
                let paymentToTarget = 0;

                if (overallTargetDebt.id === targetDebt.id) {
                    let paymentPool = totalMonthlyPayment;
                    tempDebts.forEach(d => {
                        if (d.id !== targetDebt.id && d.balance > 0) {
                            const payment = Math.min(d.balance, d.minPayment);
                            d.balance -= payment;
                            paymentPool -= payment;
                        }
                    });
                    paymentToTarget = Math.min(currentTargetState.balance, paymentPool);
                } else {
                    paymentToTarget = Math.min(currentTargetState.balance, currentTargetState.minPayment);
                    let paymentPool = totalMonthlyPayment;
                     tempDebts.forEach(d => {
                        if (d.id !== overallTargetDebt.id && d.balance > 0) {
                            const payment = Math.min(d.balance, d.minPayment);
                            d.balance -= payment;
                            paymentPool -= payment;
                        }
                    });
                    if(overallTargetDebt.balance > 0) {
                        const snowballPayment = Math.min(overallTargetDebt.balance, paymentPool);
                        overallTargetDebt.balance -= snowballPayment;
                    }
                }

                const principalPaid = paymentToTarget - interestForMonth;
                currentTargetState.balance -= paymentToTarget;

                scheduleData.push({
                    month,
                    payment: paymentToTarget,
                    principal: principalPaid,
                    interest: interestForMonth,
                    endingBalance: currentTargetState.balance,
                });
            }
            return scheduleData;
        };
        return calculateAmortization();
    }, [targetDebt, allDebts, extraPayment, strategy]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-2xl m-4 flex flex-col" style={{maxHeight: '80vh'}}>
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Amortization for {targetDebt.name}</h2>
                <div className="flex-grow overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-700 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-3">Month</th>
                                <th scope="col" className="px-4 py-3">Payment</th>
                                <th scope="col" className="px-4 py-3">Principal</th>
                                <th scope="col" className="px-4 py-3">Interest</th>
                                <th scope="col" className="px-4 py-3">Ending Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {schedule.map(row => (
                                <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-4 py-2">{row.month}</td>
                                    <td className="px-4 py-2 text-green-600 dark:text-green-400">${row.payment.toFixed(2)}</td>
                                    <td className="px-4 py-2">${row.principal.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-red-600 dark:text-red-400">${row.interest.toFixed(2)}</td>
                                    <td className="px-4 py-2 font-semibold text-slate-800 dark:text-slate-200">${row.endingBalance > 0 ? row.endingBalance.toFixed(2) : '0.00'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                     <button onClick={onClose} className="bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- NEW/UPDATED COMPONENTS ---

function Tooltip({ children, text }) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative flex items-center" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
            {children}
            {visible && (
                <div className="absolute bottom-full mb-2 w-max max-w-xs bg-slate-800 text-white text-xs rounded-md py-1 px-2 z-10 text-center">
                    {text}
                </div>
            )}
        </div>
    );
}

function EducationalTipCard() {
    const tips = [
        "Consider making bi-weekly payments to reduce your principal faster.",
        "Always try to pay more than the minimum payment, even if it's just a small amount.",
        "Building an emergency fund can prevent you from going into debt for unexpected expenses.",
        "Review your credit report annually for errors. It's free!",
        "Automating your payments can help you avoid late fees and dings to your credit score.",
        "Call your credit card company to ask for a lower interest rate. The worst they can say is no!",
    ];

    const tip = useMemo(() => tips[Math.floor(Math.random() * tips.length)], []);

    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 text-yellow-800 dark:text-yellow-300 p-4 rounded-r-lg shadow-md">
            <div className="flex">
                <div className="py-1"><Lightbulb className="h-6 w-6 text-yellow-500 mr-4"/></div>
                <div>
                    <p className="font-bold">Pro Tip</p>
                    <p className="text-sm">{tip}</p>
                </div>
            </div>
        </div>
    );
}

function TabbedToolsCard({ debts, extraPayment, strategy }) {
    const [activeTab, setActiveTab] = useState('projections');

    if (debts.length === 0) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'projections':
                return <PayoffProjections debts={debts} extraPayment={extraPayment} />;
            case 'simulator':
                return <WhatIfSimulator debts={debts} extraPayment={extraPayment} strategy={strategy} />;
            case 'tip':
                return <div className="pt-2"><EducationalTipCard /></div>;
            default:
                return null;
        }
    };
    
    const TabButton = ({ tabName, label }) => (
        <button 
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === tabName ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="border-b border-slate-200 dark:border-slate-700 flex px-2">
                <TabButton tabName="projections" label="Projections" />
                <TabButton tabName="simulator" label="Simulator" />
                <TabButton tabName="tip" label="Pro Tip" />
            </div>
            <div className="p-6">
                {renderContent()}
            </div>
        </div>
    );
}
