import { Web3Service } from './../service/web3.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-transaccion',
  templateUrl: './transaccion.component.html',
  styleUrls: ['./transaccion.component.css']
})
export class TransaccionComponent implements OnInit {
  transactionForm = new FormGroup({
    toAddress: new FormControl(''),
    amount: new FormControl(0),
  });

  address: string = '';
  balance: number = 0;
  isConnecting: boolean = false;
  web3Initialized: boolean = false;

  constructor(private web3Service: Web3Service) { }

  async ngOnInit() { }

  async connectWallet() {
    if (!this.isConnecting) {
      this.isConnecting = true;
      try {
        await this.web3Service.initWeb3();
        this.address = await this.web3Service.getAddress();
        this.balance = await this.web3Service.getBalance();
        console.log('MetaMask connected:');
        console.log('Address:', this.address);
        console.log('Balance:', this.balance);
        this.web3Initialized = true;
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      } finally {
        this.isConnecting = false;
      }
    } else {
      console.warn('Request to connect to MetaMask is already in progress.');
    }
  }

  async sendTransaction() {
    const toAddress = this.transactionForm?.get('toAddress')?.value;
    const amount = this.transactionForm?.get('amount')?.value;

    if (toAddress && amount) {
      try {
        if (!this.web3Initialized) {
          console.warn('Web3 is not initialized. Please connect to MetaMask first.');
          return;
        }
        this.transactionForm.disable();
        await this.web3Service.sendTransaction(toAddress, amount);
        this.balance = await this.web3Service.getBalance();
        this.transactionForm.reset();
      } catch (error) {
        console.error('Error sending transaction:', error);
      } finally {
        this.transactionForm.enable();
      }
    }
  }

  disconnectWallet() {
    this.web3Service.disconnect();
    this.address = '';
    this.balance = 0;
    this.web3Initialized = false;
    console.log('Wallet disconnected');
    // Optional: Reload the page to force MetaMask disconnection
    location.reload();
  }

  async disconnectMetaMask() {
    await this.web3Service.disconnectMetaMask();
    this.address = '';
    this.balance = 0;
    this.web3Initialized = false;
    console.log('MetaMask disconnected');
  }
}
