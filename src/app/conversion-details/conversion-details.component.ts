import { Component, OnInit } from '@angular/core';
import { ConversionService } from '../conversion.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CURRENCIES } from '../models/currencies';
import { Observable, of } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { BuyInfo, ValueTypes } from '../models';

type RateType = 'buy' | 'sell';

@Component({
  selector: 'phantom-conversion-details',
  templateUrl: './conversion-details.component.html',
  styleUrls: ['./conversion-details.component.less']
})
export class ConversionDetailsComponent implements OnInit {
  public currencyList: string[] = [];
  public minDate = new Date(1999, 1, 1);
  public todaysDate = new Date();
  public filteredBuyCurrency: Observable<string[]>;
  public filteredBuyCurrencyExchanged: Observable<string[]>;
  public filteredSellCurrency: Observable<string[]>;
  public filteredSellCurrencyExchanged: Observable<string[]>;
  public buyForm: FormGroup = new FormGroup({});
  public sellForm: FormGroup = new FormGroup({});
  public rateControlValidators = [Validators.required, Validators.pattern(`^[0-9]\\d*(\\.\\d+)?$`)];
  public buyPriceExchanged: number; 
  public sellPriceExchanged: number;

  constructor(private conversionService: ConversionService, private fb: FormBuilder) {
  }

  async ngOnInit() {
    this.buyForm = this.fb.group({
      buyDate: new FormControl(this.todaysDate),
      buyCurrency: new FormControl('EUR', [Validators.required]),
      buyRate: new FormControl(1, this.rateControlValidators),
      buyPrice: new FormControl(100000, this.rateControlValidators),
      buyCurrencyExchanged: new FormControl('USD', [Validators.required]),
      buyRateExchanged: new FormControl('', this.rateControlValidators),
    });
    this.sellForm = this.fb.group({
      sellDate: new FormControl(this.todaysDate),
      sellCurrency: new FormControl('EUR', [Validators.required]),
      sellRate: new FormControl(1, this.rateControlValidators),
      sellPrice: new FormControl(100000, this.rateControlValidators),
      sellCurrencyExchanged: new FormControl('USD', [Validators.required]),
      sellRateExchanged: new FormControl('', this.rateControlValidators),
    });
    this.buyForm.valueChanges.subscribe((value) => {
      console.log('buyForm => value', value);
      console.log('buyForm: ', this.buyForm);
      const isValid = this.buyForm.valid;
      if (!isValid) {
        return;
      }
      this.buyPriceExchanged = this.convertValue('buy');
    });
    this.sellForm.valueChanges.subscribe(() => {
      const isValid = this.sellForm.valid;
      if (!isValid) {
        return;
      }
      this.sellPriceExchanged = this.convertValue('sell');
    });
    this.currencyList = await this.conversionService.getCurrencyList();
    this.filteredBuyCurrency = this.buyForm.get(ValueTypes.BuyCurrency).valueChanges.pipe(
      startWith('EUR'),
      map((currency) => this.filterCurrencyList(currency, ValueTypes.BuyCurrency)),
    );
    this.filteredBuyCurrencyExchanged = this.buyForm.get(ValueTypes.BuyCurrencyExchanged).valueChanges.pipe(
      startWith('USD'),
      map((currency) => this.filterCurrencyList(currency, ValueTypes.BuyCurrencyExchanged)),
    );
    this.filteredSellCurrency = this.sellForm.get(ValueTypes.SellCurrency).valueChanges.pipe(
      startWith('EUR'),
      map((currency) => this.filterCurrencyList(currency, ValueTypes.SellCurrency)),
    );
    this.filteredSellCurrencyExchanged = this.sellForm.get(ValueTypes.SellCurrencyExchanged).valueChanges.pipe(
      startWith('USD'),
      map((currency) => this.filterCurrencyList(currency, ValueTypes.SellCurrencyExchanged)),
    );
    this.buyForm.get(ValueTypes.BuyDate).valueChanges.subscribe((date: Date) => {
      this.getExchangeRate(this.buyCurrency, ValueTypes.BuyDate, date)
    })
    this.sellForm.get(ValueTypes.SellDate).valueChanges.subscribe((date: Date) => {
      this.getExchangeRate(this.sellCurrency, ValueTypes.SellDate, date)
    })
  }

  private filterCurrencyList(currency: string, type: ValueTypes): string[] {
    if (currency === '' || currency === undefined) {
      return this.currencyList;
    } else {
      const response = this.currencyList.filter((value) => value.includes(currency.toUpperCase()))
      if (!!response) {
        this.getExchangeRate(currency, type);
      }
      return this.currencyList.filter((value) => value.includes(currency.toUpperCase()));
    }
  }

  convertValue(type: RateType): number  {
    return type === 'buy'
      ? this.conversionService.convertRate(this.buyForm.value.buyRate, this.buyForm.value.buyRateExchanged, this.buyForm.value.buyPrice)
      : this.conversionService.convertRate(this.sellForm.value.sellRate, this.sellForm.value.sellRateExchanged, this.sellForm.value.sellPrice);
  }

  setBuyPriceExchanged(): void {
    this.buyPriceExchanged = this.convertValue('buy');
  }

  setSellPriceExchanged(): void {
    this.sellPriceExchanged = this.convertValue('sell');
  }

  async getExchangeRate(currency: string, type: ValueTypes, date?: Date): Promise<void> {
    switch (type) {
      case ValueTypes.BuyDate:
        this.setBuyRateExchanged = await this.conversionService.getExchangeRate(currency, this.buyCurrencyExchanged, date);
        break;
      case ValueTypes.BuyCurrency:
        this.setBuyRateExchanged = await this.conversionService.getExchangeRate(currency, this.buyCurrencyExchanged);
        break;
      case ValueTypes.BuyCurrencyExchanged:
        this.setBuyRateExchanged = await this.conversionService.getExchangeRate(this.buyCurrency, currency);
        break;
      case ValueTypes.SellDate:
        this.setSellRateExchanged = await this.conversionService.getExchangeRate(currency, this.sellCurrencyExchanged, date);
        break;
      // case ValueTypes.SellCurrency:
      //   this.setSellRate = await this.conversionService.getExchangeRate(currency, this.sellCurrencyExchanged);
      //   break;
      case ValueTypes.SellCurrencyExchanged:
        this.setSellRateExchanged = await this.conversionService.getExchangeRate(this.sellCurrency, currency);

        break;
    
      default:
        break;
    }
  }

  finalResult(): boolean {
    return this.sellPriceExchanged > this.buyPriceExchanged;
  }

  get buyDate(): Date {
    return this.buyForm.get(ValueTypes.BuyDate).value;
  }

  get buyCurrency(): string {
    return this.buyForm.get('buyCurrency').value;
  }

  set setBuyRate(rate: number) {
    this.buyForm.get('buyRate').setValue(rate);
  }

  get buyRate(): number {
    return this.buyForm.get('buyRate').value;
  }

  get buyPrice(): number  {
    return this.buyForm.get('buyPrice').value;
  }

  get buyCurrencyExchanged(): string {
    return this.buyForm.get('buyCurrencyExchanged').value;
  }

  set setBuyRateExchanged(rate: number)  {
    this.buyForm.get('buyRateExchanged').setValue(rate);
  }

  get buyRateExchanged(): number  {
    return this.buyForm.get('buyRateExchanged').value;
  }

  get sellDate(): Date {
    return this.buyForm.get('sellDate').value;
  }

  get sellCurrency(): string {
    return this.sellForm.get('sellCurrency').value;
  }

  set setSellRate(rate: number) {
    this.sellForm.get('sellRate').setValue(rate);
  }

  get sellRate(): number  {
    return this.sellForm.get('sellRate').value;
  }

  get sellPrice(): number  {
    return this.sellForm.get('sellPrice').value;
  }

  get sellCurrencyExchanged(): string {
    return this.sellForm.get('sellCurrencyExchanged').value;
  }

  set setSellRateExchanged(rate: number) {
    this.sellForm.get('sellRateExchanged').setValue(rate);
  }

  get sellRateExchanged(): number  {
    return this.sellForm.get('sellRateExchanged').value;
  }
}
