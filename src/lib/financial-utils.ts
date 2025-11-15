/**
 * Calculate the number of periods per year based on frequency
 */
export function getPeriodsPerYear(frequency: string): number {
  switch (frequency) {
    case 'hourly':
      return 8760; // 365 * 24
    case 'daily':
      return 365;
    case 'weekly':
      return 52;
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'yearly':
      return 1;
    default:
      return 12;
  }
}

/**
 * Calculate future value of SIP with compound interest
 * FV = P * [(1 + r)^n - 1] / r
 * Where:
 * P = periodic payment
 * r = periodic interest rate
 * n = number of periods
 */
export function calculateSIPFutureValue(
  periodicAmount: number,
  annualRate: number,
  periodsPerYear: number,
  totalPeriods: number
): number {
  const periodicRate = annualRate / 100 / periodsPerYear;
  const totalPeriodicPayments = totalPeriods;

  if (periodicRate === 0) {
    return periodicAmount * totalPeriodicPayments;
  }

  const futureValue = periodicAmount * ((Math.pow(1 + periodicRate, totalPeriodicPayments) - 1) / periodicRate);
  return futureValue;
}

/**
 * Calculate compound interest for FD
 * A = P * (1 + r/n)^(nt)
 * Where:
 * A = final amount
 * P = principal
 * r = annual interest rate (decimal)
 * n = number of times interest is compounded per year
 * t = time in years
 */
export function calculateFDMaturity(
  principal: number,
  annualRate: number,
  years: number,
  compoundingFrequency: number = 12
): number {
  const rate = annualRate / 100;
  const maturityAmount = principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * years);
  return maturityAmount;
}

/**
 * Calculate total interest for FD
 */
export function calculateFDInterest(principal: number, maturityAmount: number): number {
  return maturityAmount - principal;
}

import { MutualFundWithHistory, MFAPIResponse, MFAPIDataPoint } from "./types";

/**
 * Calculate XIRR using Newton-Raphson method for irregular cash flows
 * This is an approximation for irregular cash flows
 */
export function calculateXIRR(cashFlows: { amount: number; date: Date }[], guess: number = 0.1): number {
  const maxIterations = 100;
  const tolerance = 0.0001;
  let rate = guess;

  // Convert dates to days from first date
  const firstDate = cashFlows[0].date;
  const days = cashFlows.map(flow => {
    const diffTime = flow.date.getTime() - firstDate.getTime();
    return diffTime / (1000 * 60 * 60 * 24); // days
  });

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      const exponent = -rate * days[j] / 365; // assuming 365 days per year
      npv += cashFlows[j].amount * Math.pow(Math.E, exponent);
      dnpv += -days[j] / 365 * cashFlows[j].amount * Math.pow(Math.E, exponent);
    }

    if (Math.abs(npv) < tolerance) {
      return rate * 100; // return as percentage
    }

    rate = rate - npv / dnpv;
  }

  return rate * 100; // return as percentage
}

/**
 * Calculate loan details from EMI, remaining installments, and remaining principal
 */
export function calculateLoanDetails(
  loanAmount: number,
  remainingInstallments: number,
  remainingPrincipal: number,
  emi: number
) {
  // Calculate paid installments (assuming we don't know total)
  // This is an approximation - we'll use a reasonable estimate
  const estimatedTotalInstallments = Math.round(loanAmount / (emi * 0.6)); // Rough estimate
  const paidInstallments = Math.max(0, estimatedTotalInstallments - remainingInstallments);

  // Principal paid so far
  const principalPaid = loanAmount - remainingPrincipal;

  // Total amount paid so far
  const totalAmountPaid = paidInstallments * emi;

  // Interest paid so far (this could be negative if estimate is wrong, so we cap it)
  const totalInterestPaid = Math.max(0, totalAmountPaid - principalPaid);

  // Future cash flows for XIRR calculation
  const cashFlows = [
    { amount: -remainingPrincipal, date: new Date() } // Initial outflow (remaining principal)
  ];

  // Add EMI payments
  for (let i = 1; i <= remainingInstallments; i++) {
    const paymentDate = new Date();
    paymentDate.setMonth(paymentDate.getMonth() + i);
    cashFlows.push({ amount: emi, date: paymentDate });
  }

  // Calculate XIRR
  const xirr = calculateXIRR(cashFlows);

  // Calculate remaining time
  const remainingMonths = remainingInstallments;
  const remainingYears = remainingMonths / 12;

  return {
    totalInterestPaid,
    totalAmountPaid,
    remainingAmount: remainingPrincipal + (emi * remainingInstallments),
    xirr,
    remainingMonths,
    remainingYears
  };
}

/**
 * Calculate comprehensive loan details including total installments
 */
export function calculateLoanDetailsWithTotal(
  loanAmount: number,
  totalInstallments: number,
  remainingInstallments: number,
  remainingPrincipal: number,
  emi: number
) {
  // Calculate paid installments
  const paidInstallments = totalInstallments - remainingInstallments;

  // Principal paid so far
  const principalPaid = loanAmount - remainingPrincipal;

  // Total amount paid so far
  const totalAmountPaid = paidInstallments * emi;

  // Interest paid so far
  const totalInterestPaid = Math.max(0, totalAmountPaid - principalPaid);

  // Total interest over entire loan period
  const totalAmountPayable = emi * totalInstallments;
  const totalInterestOverLoan = totalAmountPayable - loanAmount;

  // Future cash flows for XIRR calculation (remaining payments)
  const cashFlows = [
    { amount: -remainingPrincipal, date: new Date() } // Initial outflow (remaining principal)
  ];

  // Add remaining EMI payments
  for (let i = 1; i <= remainingInstallments; i++) {
    const paymentDate = new Date();
    paymentDate.setMonth(paymentDate.getMonth() + i);
    cashFlows.push({ amount: emi, date: paymentDate });
  }

  // Calculate XIRR for remaining payments
  const xirr = calculateXIRR(cashFlows);

  // Calculate remaining time
  const remainingMonths = remainingInstallments;
  const remainingYears = remainingMonths / 12;

  return {
    totalInterestPaid,
    totalAmountPaid,
    remainingAmount: remainingPrincipal + (emi * remainingInstallments),
    xirr,
    remainingMonths,
    remainingYears,
    totalInterestOverLoan,
    totalAmountPayable,
    paidInstallments,
  };
}

/**
 * Calculate percentage change between two NAV values
 */
export function calculatePercentageChange(currentNav: number, previousNav: number): number {
  if (previousNav === 0) return 0;
  return ((currentNav - previousNav) / previousNav) * 100;
}

/**
 * Get NAV value for a specific date from historical prices
 */
export function getNavForDate(historicalPrices: { date: Date; nav: number }[], targetDate: Date): number | null {
  // Find the closest date (on or before the target date)
  const sortedPrices = historicalPrices.sort((a, b) => b.date.getTime() - a.date.getTime());

  for (const price of sortedPrices) {
    if (price.date <= targetDate) {
      return price.nav;
    }
  }

  return null;
}

/**
 * Calculate various time period changes for a mutual fund
 */
export function calculateFundChanges(historicalPrices: { date: Date; nav: number }[]) {
  if (historicalPrices.length === 0) {
    return {
      day1: 0,
      week1: 0,
      month1: 0,
      month3: 0,
      month6: 0,
      year1: 0
    };
  }

  const sortedPrices = historicalPrices.sort((a, b) => b.date.getTime() - a.date.getTime());
  const latestNav = sortedPrices[0].nav;
  const latestDate = sortedPrices[0].date;

  // Calculate target dates
  const day1Date = new Date(latestDate);
  day1Date.setDate(day1Date.getDate() - 1);

  const week1Date = new Date(latestDate);
  week1Date.setDate(week1Date.getDate() - 7);

  const month1Date = new Date(latestDate);
  month1Date.setMonth(month1Date.getMonth() - 1);

  const month3Date = new Date(latestDate);
  month3Date.setMonth(month3Date.getMonth() - 3);

  const month6Date = new Date(latestDate);
  month6Date.setMonth(month6Date.getMonth() - 6);

  const year1Date = new Date(latestDate);
  year1Date.setFullYear(year1Date.getFullYear() - 1);

  // Get NAV values for each period
  const day1Nav = getNavForDate(sortedPrices, day1Date);
  const week1Nav = getNavForDate(sortedPrices, week1Date);
  const month1Nav = getNavForDate(sortedPrices, month1Date);
  const month3Nav = getNavForDate(sortedPrices, month3Date);
  const month6Nav = getNavForDate(sortedPrices, month6Date);
  const year1Nav = getNavForDate(sortedPrices, year1Date);

  return {
    day1: day1Nav ? calculatePercentageChange(latestNav, day1Nav) : 0,
    week1: week1Nav ? calculatePercentageChange(latestNav, week1Nav) : 0,
    month1: month1Nav ? calculatePercentageChange(latestNav, month1Nav) : 0,
    month3: month3Nav ? calculatePercentageChange(latestNav, month3Nav) : 0,
    month6: month6Nav ? calculatePercentageChange(latestNav, month6Nav) : 0,
    year1: year1Nav ? calculatePercentageChange(latestNav, year1Nav) : 0
  };
}

/**
 * Fetch mutual fund data from MFAPI (duplicate of hook function for search component)
 */
export async function fetchMutualFundData(schemeCode: number): Promise<MutualFundWithHistory | null> {
  try {
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!response.ok) {
      console.warn(`Failed to fetch data for scheme ${schemeCode}: ${response.status}`);
      return null;
    }

    const data: MFAPIResponse = await response.json();

    if (data.status !== 'SUCCESS' || !data.data || data.data.length === 0) {
      console.warn(`Invalid data for scheme ${schemeCode}`);
      return null;
    }

    // Parse DD-MM-YYYY date string to Date object
    const parseMFAPIDate = (dateStr: string): Date => {
      const [day, month, year] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    // Sort data by date (oldest first)
    const sortedData = data.data.sort((a: MFAPIDataPoint, b: MFAPIDataPoint) => {
      const dateA = parseMFAPIDate(a.date);
      const dateB = parseMFAPIDate(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Use all available data (no filtering to 1 year)
    const allData = sortedData;

    if (allData.length === 0) {
      console.warn(`No data available for scheme ${schemeCode}`);
      return null;
    }

    // Convert to our internal format
    const historicalPrices = allData.map((item: MFAPIDataPoint) => ({
      date: parseMFAPIDate(item.date),
      nav: parseFloat(item.nav)
    }));

    // Get latest NAV and date
    const latestData = allData[allData.length - 1];
    const currentNav = parseFloat(latestData.nav);
    const navDate = parseMFAPIDate(latestData.date);

    const mutualFund: MutualFundWithHistory = {
      id: schemeCode.toString(),
      name: data.meta.scheme_name,
      schemeCode: data.meta.scheme_code,
      category: data.meta.scheme_category,
      fundHouse: data.meta.fund_house,
      currentNav,
      navDate,
      riskLevel: 'Moderate' as const, // Default
      expenseRatio: 0.5, // Default
      aum: 10000, // Default
      historicalPrices
    };

    return mutualFund;
  } catch (error) {
    console.error(`Error fetching data for scheme ${schemeCode}:`, error);
    return null;
  }
}

/**
 * Get stock price for a specific date from historical prices
 */
export function getStockPriceForDate(historicalPrices: { date: Date; price: number }[], targetDate: Date): number | null {
  // Find the closest date (on or before target date)
  const sortedPrices = historicalPrices.sort((a, b) => b.date.getTime() - a.date.getTime());

  for (const price of sortedPrices) {
    if (price.date <= targetDate) {
      return price.price;
    }
  }

  return null;
}

/**
 * Calculate various time period changes for a stock
 */
export function calculateStockChanges(historicalPrices: { date: Date; price: number }[]) {
  if (historicalPrices.length === 0) {
    return {
      day1: 0,
      week1: 0,
      month1: 0,
      month3: 0,
      month6: 0,
      year1: 0
    };
  }

  const sortedPrices = historicalPrices.sort((a, b) => b.date.getTime() - a.date.getTime());
  const latestPrice = sortedPrices[0].price;
  const latestDate = sortedPrices[0].date;

  // Calculate target dates
  const day1Date = new Date(latestDate);
  day1Date.setDate(day1Date.getDate() - 1);

  const week1Date = new Date(latestDate);
  week1Date.setDate(week1Date.getDate() - 7);

  const month1Date = new Date(latestDate);
  month1Date.setMonth(month1Date.getMonth() - 1);

  const month3Date = new Date(latestDate);
  month3Date.setMonth(month3Date.getMonth() - 3);

  const month6Date = new Date(latestDate);
  month6Date.setMonth(month6Date.getMonth() - 6);

  const year1Date = new Date(latestDate);
  year1Date.setFullYear(year1Date.getFullYear() - 1);

  // Get price values for each period
  const day1Price = getStockPriceForDate(sortedPrices, day1Date);
  const week1Price = getStockPriceForDate(sortedPrices, week1Date);
  const month1Price = getStockPriceForDate(sortedPrices, month1Date);
  const month3Price = getStockPriceForDate(sortedPrices, month3Date);
  const month6Price = getStockPriceForDate(sortedPrices, month6Date);
  const year1Price = getStockPriceForDate(sortedPrices, year1Date);

  return {
    day1: day1Price ? calculatePercentageChange(latestPrice, day1Price) : 0,
    week1: week1Price ? calculatePercentageChange(latestPrice, week1Price) : 0,
    month1: month1Price ? calculatePercentageChange(latestPrice, month1Price) : 0,
    month3: month3Price ? calculatePercentageChange(latestPrice, month3Price) : 0,
    month6: month6Price ? calculatePercentageChange(latestPrice, month6Price) : 0,
    year1: year1Price ? calculatePercentageChange(latestPrice, year1Price) : 0
  };
}

/**
 * Calculate volatility (standard deviation of daily returns) for a given period
 */
export function calculateVolatility(historicalPrices: { date: Date; price: number }[], days: number): number {
  if (historicalPrices.length < days + 1) return 0;

  const sortedPrices = historicalPrices.sort((a, b) => a.date.getTime() - b.date.getTime());
  const recentPrices = sortedPrices.slice(-days - 1);

  if (recentPrices.length < 2) return 0;

  // Calculate daily returns
  const returns: number[] = [];
  for (let i = 1; i < recentPrices.length; i++) {
    const returnRate = (recentPrices[i].price - recentPrices[i - 1].price) / recentPrices[i - 1].price;
    returns.push(returnRate);
  }

  if (returns.length === 0) return 0;

  // Calculate mean
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;

  // Calculate variance
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;

  // Return standard deviation (volatility) as percentage
  return Math.sqrt(variance) * 100;
}

/**
 * Calculate average volume for a given period
 */
export function calculateAverageVolume(volume: { date: Date; volume: number }[], days: number): number {
  if (volume.length === 0) return 0;

  const sortedVolume = volume.sort((a, b) => b.date.getTime() - a.date.getTime());
  const recentVolume = sortedVolume.slice(0, days);

  if (recentVolume.length === 0) return 0;

  const totalVolume = recentVolume.reduce((sum, vol) => sum + vol.volume, 0);
  return totalVolume / recentVolume.length;
}

/**
 * Calculate comprehensive volatility statistics for different time periods
 */
export function calculateVolatilityStats(historicalPrices: { date: Date; price: number }[]) {
  return {
    day2: calculateVolatility(historicalPrices, 2),
    day3: calculateVolatility(historicalPrices, 3),
    day4: calculateVolatility(historicalPrices, 4),
    day5: calculateVolatility(historicalPrices, 5),
    week2: calculateVolatility(historicalPrices, 14)
  };
}

/**
 * Calculate comprehensive volume statistics for different time periods
 */
export function calculateVolumeStats(volume: { date: Date; volume: number }[]) {
  return {
    day1: calculateAverageVolume(volume, 1),
    day2: calculateAverageVolume(volume, 2),
    day3: calculateAverageVolume(volume, 3),
    day4: calculateAverageVolume(volume, 4),
    day5: calculateAverageVolume(volume, 5),
    week2: calculateAverageVolume(volume, 14),
    month: calculateAverageVolume(volume, 30)
  };
}