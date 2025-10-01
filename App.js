import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './src/components/Navigation';
import Home from './src/components/Home';
import AddExpense from './src/components/AddExpense';
import Analytics from './src/components/Analytics';
import Budget from './src/components/Budget';
import Recurring from './src/components/Recurring';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);

  useEffect(() => {
    loadData();
    processRecurringExpenses();
  }, []);

  const loadData = () => {
    const expensesData = localStorage.getItem('expenses');
    const budgetsData = localStorage.getItem('budgets');
    const recurringData = localStorage.getItem('recurring');
    
    if (expensesData) setExpenses(JSON.parse(expensesData));
    if (budgetsData) setBudgets(JSON.parse(budgetsData));
    if (recurringData) setRecurringExpenses(JSON.parse(recurringData));
  };

  const saveExpenses = (newExpenses) => {
    localStorage.setItem('expenses', JSON.stringify(newExpenses));
    setExpenses(newExpenses);
  };

  const saveBudgets = (newBudgets) => {
    localStorage.setItem('budgets', JSON.stringify(newBudgets));
    setBudgets(newBudgets);
  };

  const saveRecurring = (newRecurring) => {
    localStorage.setItem('recurring', JSON.stringify(newRecurring));
    setRecurringExpenses(newRecurring);
  };

  const processRecurringExpenses = () => {
    const recurringData = localStorage.getItem('recurring');
    const expensesData = localStorage.getItem('expenses');
    
    if (!recurringData) return;
    
    const recurring = JSON.parse(recurringData);
    const currentExpenses = expensesData ? JSON.parse(expensesData) : [];
    const now = new Date();
    let newExpenses = [...currentExpenses];
    let updatedRecurring = [];

    recurring.forEach(item => {
      const lastProcessed = new Date(item.lastProcessed || item.createdAt);
      const daysSince = Math.floor((now - lastProcessed) / (1000 * 60 * 60 * 24));
      
      let shouldProcess = false;
      if (item.frequency === 'daily' && daysSince >= 1) shouldProcess = true;
      else if (item.frequency === 'weekly' && daysSince >= 7) shouldProcess = true;
      else if (item.frequency === 'monthly' && daysSince >= 30) shouldProcess = true;

      if (shouldProcess && item.isActive) {
        newExpenses.push({
          id: Date.now().toString() + Math.random(),
          amount: item.amount,
          category: item.category,
          description: `${item.description} (Auto-logged)`,
          date: now.toISOString(),
          createdAt: now.toISOString(),
          isRecurring: true,
        });
        
        updatedRecurring.push({
          ...item,
          lastProcessed: now.toISOString(),
        });
      } else {
        updatedRecurring.push(item);
      }
    });

    if (newExpenses.length !== currentExpenses.length) {
      saveExpenses(newExpenses);
      saveRecurring(updatedRecurring);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home expenses={expenses} />} />
            <Route path="/add" element={<AddExpense expenses={expenses} saveExpenses={saveExpenses} />} />
            <Route path="/analytics" element={<Analytics expenses={expenses} />} />
            <Route path="/budget" element={<Budget budgets={budgets} saveBudgets={saveBudgets} expenses={expenses} />} />
            <Route path="/recurring" element={<Recurring recurringExpenses={recurringExpenses} saveRecurring={saveRecurring} saveExpenses={saveExpenses} expenses={expenses} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;