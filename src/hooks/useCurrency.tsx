'use client'
import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext<any>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {

    const [currency, setCurrency] = useState("USD");

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

    useEffect(() => {

        fetchRates();

        const interval = setInterval(() => {
            fetchRates();
        }, 1000 * 60 * 60 * 24); // 24 horas

        return () => clearInterval(interval);

    }, []);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, rates }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    return useContext(CurrencyContext);
}