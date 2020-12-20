import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConversionService {

  constructor() { }

  convertRate(rate1: number, rate2: number, price: number): number {
    // return startValue * (rate1 / rate2);
    return price * rate2;
  }

  async getExchangeRate(currency: string, exchangeCurrency: string, date?: Date) {
    const endpoint = date ? `${date.toLocaleDateString('en-CA')}` : 'latest';
    const url = `https://api.exchangeratesapi.io/${endpoint}?base=${currency}`;
    if (currency === exchangeCurrency) {
      return 1;
    }
    try {
      const response = await fetch(url);
      const data = await response.json();
      return Number(data.rates[exchangeCurrency]);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async getCurrencyList() {
    const url = 'https://api.exchangeratesapi.io/latest?base=USD';
    try {
      const response = await fetch(url);
      const data = await response.json();
      return Object.keys(data.rates).sort((a, b) => a < b ? -1 : 1);
    } catch (error) {
      console.log(error);
    }
  }

  async getCurrencyHistory(currency: string, exchangeCurrency: string) {
    const url = `https://api.exchangeratesapi.io/history?start_at=1999-01-01&end_at=2020-09-01&base=${currency}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      const keys = Object.keys(data.rates).sort((a, b) => a < b ? -1 : 1);
      const history = keys.map((key: string) => ({
        date: key,
        value: data.rates[key][exchangeCurrency],
      }));
      return history;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}
