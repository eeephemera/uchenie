import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Web3 from 'web3';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const web3 = new Web3('http://localhost:8545'); // Подключение к вашему Ethereum узлу
const contractAddress = '0xa513e6e4b8f2a923d98304ec87f64353c4d5c853'; // Адрес вашего смарт-контракта
const contractPath = path.resolve('./artifacts/contracts/MoskovskiyPlehanovaToken.sol/MoskovskiyPlehanovaToken.json');

export async function POST(request: NextRequest) {
  try {
    const { workId, grade, studentAddress } = await request.json();

    console.log('Получен запрос на вознаграждение студента:', { workId, grade, studentAddress });

    // Валидация входных данных
    if (typeof workId !== 'number' || typeof grade !== 'number' || grade < 1 || grade > 5 || typeof studentAddress !== 'string') {
      console.error('Некорректные данные');
      return NextResponse.json({ message: 'Некорректные данные' }, { status: 400 });
    }

    // Обновление оценки студента в базе данных
    const updatedStudent = await prisma.attachedFile.update({
      where: { id: workId },
      data: { grade },
    });

    console.log('Оценка успешно обновлена в базе данных');

    // Check if the file exists at the specified path
    if (!fs.existsSync(contractPath)) {
      console.error('Файл не существует:', contractPath);
      return NextResponse.json({ message: 'Файл не существует' }, { status: 500 });
    }

    // Log the content of the JSON file to ensure it's being read correctly
    const contractJson = fs.readFileSync(contractPath, 'utf8');
    console.log('Contract JSON:', contractJson);

    // Чтение ABI из файла и создание экземпляра контракта
    const contractJsonParsed = JSON.parse(contractJson); // Parse JSON
    const abi = contractJsonParsed.abi;
    const contract = new web3.eth.Contract(abi, contractAddress);

    // Отправка токенов студенту через смарт-контракт
    const tokensToSend = 100; // Количество токенов для отправки
    let transactionReceipt;

    try {
      transactionReceipt = await contract.methods.rewardStudent(studentAddress, tokensToSend)
        .send({ from: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' });
      console.log('Транзакция:', transactionReceipt);
    } catch (transactionError) {
      console.error('Ошибка при отправке транзакции:', transactionError);
      return NextResponse.json({ message: 'Ошибка при отправке транзакции' }, { status: 500 });
    }

    // Проверяем, была ли транзакция успешно подтверждена
    if (transactionReceipt.status) {
      console.log(`Студент ${studentAddress} успешно получил ${tokensToSend} токенов.`);
    } else {
      console.error(`Ошибка: транзакция не была подтверждена.`);
      return NextResponse.json({ message: 'Транзакция не была подтверждена' }, { status: 500 });
    }

    // Возврат успешного ответа
    return NextResponse.json({ message: 'Оценка успешно обновлена и токены отправлены', updatedStudent }, { status: 200 });
  } catch (error) {
    console.error('Ошибка при обновлении оценки и отправке токенов:', error);
    return NextResponse.json({ message: 'Ошибка при обновлении оценки и отправке токенов' }, { status: 500 });
  }
}