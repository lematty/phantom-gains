import { Component, Input, OnInit } from '@angular/core';
import { ConversionService } from '../conversion.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'phantom-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less']
})
export class ChartComponent implements OnInit {
  @Input('buyCurrency') buyCurrency: string = 'EUR';
  @Input('buyCurrencyExchanged') buyCurrencyExchanged: string = 'USD';

  public loading = true;

  constructor(private conversionService: ConversionService) { }

  async ngOnInit(): Promise<void> {
    const { keys, values } = await this.getCurrencyHistory();
    const chart = new Chart('myChart', {
      type: 'bar',
      data: {
          // labels: ["1999-01-04", "1999-01-05", "1999-01-06", "1999-01-07", "1999-01-08", "1999-01-11", "1999-01-12", "1999-01-13"],
          labels: keys,
          datasets: [
            {
              type: 'line',
              label: `${this.buyCurrency}`,
              data: values.map(() => 1),
              backgroundColor: 'blue',
              borderColor: 'blue',
              borderWidth: 5,
              fill: false,
            },
            {
              label: `${this.buyCurrencyExchanged}`,
              // data: [1.1789, 1.179, 1.1743, 0.8, 1.1659, 1.1569, 1.152, 1.1744],
              data: values,
              backgroundColor: 'green',
              borderColor: 'green',
              borderWidth: 1,
              fill: 1,
            },
          ]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      // beginAtZero: true
                  }
              }]
          }
      },
  });
  }

  async getCurrencyHistory() {
    return await this.conversionService.getCurrencyHistory(this.buyCurrency, this.buyCurrencyExchanged);
    // console.log('test: ', test);
    this.loading = false;
  }
}
