'use client'
import { createContext, useContext, useState, useEffect, useRef } from "react";

const CurrencyContext = createContext<any>(null);

const STORAGE_KEY = "preferredCurrency";
const SUPPORTED_CURRENCIES = ["USD", "MXN", "PEN", "EUR", "CLP", "COP", "BOB", "BRL"];

const EURO_COUNTRIES = new Set([
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT",
  "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
]);

const getCurrencyByCountry = (countryCode: string) => {
  const code = (countryCode || "").toUpperCase();
  if (code === "MX") return "MXN";
  if (code === "PE") return "PEN";
  if (EURO_COUNTRIES.has(code)) return "EUR";
  return "USD";
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {

    const [currency, setCurrency] = useState("USD");
    const manualSelectionRef = useRef(false);

    const [rates, setRates] = useState<{ [key: string]: number }>({
        USD: 1
    });

    const fetchRates = async () => {
        try {

            const res = await fetch(
                "https://api.currencyfreaks.com/v2.0/rates/latest?apikey=7a9176148b834e78aa12ea3817cdd120"
            );

            const data = await res.json();

            if (data?.rates) {

                const parsedRates: { [key: string]: number } = {};

                Object.keys(data.rates).forEach((key) => {
                    parsedRates[key] = Number(data.rates[key]);
                });

                setRates(parsedRates);

            }

        } catch (err) {

            console.error("Error fetching currency rates", err);

        }
    };

    const setCurrencyWithPersistence = (newCurrency: string) => {
        const normalized = String(newCurrency || "USD").toUpperCase();
        const nextCurrency = SUPPORTED_CURRENCIES.includes(normalized) ? normalized : "USD";
        manualSelectionRef.current = true;
        setCurrency(nextCurrency);
        localStorage.setItem(STORAGE_KEY, nextCurrency);
    };

    useEffect(() => {
        const fromStorage = localStorage.getItem(STORAGE_KEY);

        if (fromStorage && SUPPORTED_CURRENCIES.includes(fromStorage.toUpperCase())) {
            setCurrency(fromStorage.toUpperCase());
            return;
        }

        const detectCountryCurrency = async () => {
            try {
                const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
                const data = await response.json();
                const detectedCurrency = getCurrencyByCountry(data?.country_code);

                if (manualSelectionRef.current) return;

                setCurrency(detectedCurrency);
                localStorage.setItem(STORAGE_KEY, detectedCurrency);
            } catch {
                if (!manualSelectionRef.current) {
                    setCurrency("USD");
                    localStorage.setItem(STORAGE_KEY, "USD");
                }
            }
        };

        detectCountryCurrency();
    }, []);

    useEffect(() => {

        fetchRates();

        const interval = setInterval(() => {
            fetchRates();
        }, 1000 * 60 * 60 * 24); // 24 horas

        return () => clearInterval(interval);

    }, []);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency: setCurrencyWithPersistence, rates }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    return useContext(CurrencyContext);
}
