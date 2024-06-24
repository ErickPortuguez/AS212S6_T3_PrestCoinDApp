import { Injectable } from '@angular/core';
import Web3 from 'web3';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3!: Web3;
  private contract: any;
  private contractAddress : any;
  private ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "_beneficiario",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_cantidad",
          "type": "uint256"
        }
      ],
      "name": "prestar",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];

  constructor() {
    // Inicialización de web3 en un método separado para evitar conflictos asincrónicos
    this.initWeb3();
  
    // Verificar si Metamask está disponible
    if (window.ethereum) {
      // Solicitar permiso al usuario para acceder a sus cuentas
      window.ethereum.enable().then(() => {
        // Inicializar web3 con el proveedor de Ethereum de Metamask
        this.web3 = new Web3(window.ethereum);
  
        // Crear un contrato inteligente con la ABI y la dirección del contrato
        this.contract = new this.web3.eth.Contract(this.ABI, this.contractAddress);
      }).catch((error: Error) => {
        console.error('Error al solicitar permiso de Metamask:', error);
      });
    } else {
      // Informar al usuario que Metamask no está instalado o habilitado
      console.warn('Metamask no encontrado. Instala o habilita Metamask.');
    }
  }

  async initWeb3() {
    if (window.ethereum) {
      await window.ethereum.enable();
      this.web3 = new Web3(window.ethereum);
      this.contract = new this.web3.eth.Contract(this.ABI, this.contractAddress);
    } else {
      console.warn('Metamask not found. Install or enable Metamask.');
    }
  }

  async getAddress(): Promise<string> {
    if (!this.web3) {
      await this.initWeb3();
    }
    const accounts = await this.web3.eth.getAccounts();
    if (accounts.length > 0) {
      return accounts[0];
    } else {
      console.error('No se encontraron direcciones de Metamask vinculadas.');
      return ''; // Or return an empty string to indicate no address
    }
  }

  async getBalance(): Promise<number> {
    if (!this.web3) {
      await this.initWeb3();
    }
    const address = await this.getAddress();
    if (address) {
      const balanceWei = await this.web3.eth.getBalance(address);
      const balanceEther = parseFloat(this.web3.utils.fromWei(balanceWei, 'ether'));
      return balanceEther;
    } else {
      console.error('No se pudo obtener la dirección para consultar el saldo.');
      return 0; // Or return 0 to indicate unknown balance
    }
  }

  async sendTransaction(toAddress: string, amount: number) {
    window.ethereum.enable().then(() => {
      this.web3 = new Web3(window.ethereum);
      this.contract = new this.web3.eth.Contract(this.ABI, toAddress);
    });
    const accounts = await this.web3.eth.getAccounts();
    const fromAddress = accounts[0];
    const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
    return this.contract.methods.prestar(toAddress, amountWei).send({ from: fromAddress, value: amountWei });
  }
}
