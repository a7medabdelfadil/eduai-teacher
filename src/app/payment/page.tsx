"use client";
import { useState } from "react";
import Container from "~/_components/Container";
import { Text } from "~/_components/Text";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { FaWallet, FaMoneyBillWave } from "react-icons/fa";
import { AiOutlineCreditCard } from "react-icons/ai";
import Image from "next/image";
import Input from "~/_components/Input";
import Button from "~/_components/Button";

const paymentMethods = [
  {
    value: "bank-card",
    label: "Bank Card",
    icon: <AiOutlineCreditCard size={20} />,
  },
  {
    value: "wallet",
    label: "Wallet",
    icon: <FaWallet size={20} />,
  },
  {
    value: "cash-deposit",
    label: "Cash Deposit",
    icon: <FaMoneyBillWave size={20} />,
  },
];

const visaCards = [
  {
    visaNumber: "1234 5678 9012 3456",
  },
  {
    visaNumber: "1234 5678 9012 0000",
  },
];

const wallets = [
  {
    name: "Vodafone Cash",
    src: "/images/vodafone.png",
  },
  {
    name: "Fawry",
    src: "/images/fawry.png",
  },
];

function Payment() {
  // State to track the selected payment method
  const [selectedPayment, setSelectedPayment] = useState<string>("bank-card");
  const [selectedVisa, setSelectedVisa] = useState<string>("visa-1");
  const [isAddingCard, setIsAddingCard] = useState<boolean>(false); // New state for adding a card
  const [isChecked, setIsChecked] = useState(false);

  // Handle value change when a radio button is selected
  const handlePaymentChange = (value: string) => {
    setSelectedPayment(value);
    setIsAddingCard(false);
  };

  const handleVisaChange = (value: string) => {
    setSelectedVisa(value);
    setIsAddingCard(false);
  };

  const handleAddCardClick = () => {
    setIsAddingCard(true); // Show the "Adding Card" UI
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <Container>
      <div className="w-full overflow-x-hidden rounded-xl bg-bgPrimary p-4">
        <Text font={"bold"} size={"4xl"}>
          Payment
        </Text>
        <Text font={"semiBold"} size={"2xl"} color={"gray"} className="mt-2">
          Choose payment method
        </Text>
        <RadioGroup.Root
          className="my-4 flex space-x-4"
          value={selectedPayment} // Bind the value to the state
          onValueChange={handlePaymentChange} // Update the state when a new option is selected
        >
          {paymentMethods.map(({ value, label, icon }) => (
            <RadioGroup.Item
              key={value}
              value={value}
              className="group flex h-20 w-1/4 flex-col justify-center rounded-lg border-2 border-borderPrimary text-center text-textSecondary transition hover:border-primary hover:text-primary focus-visible:ring focus-visible:ring-blue-200 focus-visible:ring-opacity-75 data-[state=checked]:border-primary data-[state=checked]:text-primary"
              id={value}
            >
              <div className="flex w-full justify-between px-4">
                <div>
                  {icon}
                  <p className="mt-1 text-xl font-semibold group-data-[state=checked]:text-primary">
                    {label}
                  </p>
                </div>
                <div className="relative h-6 w-6 rounded-full border-2 border-borderPrimary group-data-[state=checked]:border-primary">
                  <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 border-bgPrimary bg-bgPrimary group-data-[state=checked]:bg-primary"></div>
                </div>
              </div>
            </RadioGroup.Item>
          ))}
        </RadioGroup.Root>
      </div>

      {/* Conditional rendering for Adding Card */}
      <div className="mt-8">
        {isAddingCard ? (
          <div className="mt-8 w-full overflow-x-hidden rounded-xl bg-bgPrimary p-4">
            <Text font={"semiBold"} size={"2xl"}>
              Add New Card
            </Text>
            <form className="mt-8 grid w-2/3 grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <label htmlFor="cardHolderName" className="text-xl">
                  Card Holder Name
                </label>
                <Input
                  id="cardHolderName"
                  placeholder="Enter card holder name"
                  theme="transparent"
                  border="gray"
                  className="mt-2"
                  maxLength={3}
                />
              </div>
              <div>
                <label htmlFor="cardNumber" className="text-xl">
                  Card Number
                </label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  theme="transparent"
                  border="gray"
                  className="mt-2"
                  maxLength={3}
                />
              </div>
              <div>
                <label htmlFor="expirationDate" className="text-xl">
                  Expiration Date
                </label>
                <Input
                  id="expirationDate"
                  placeholder="MM/YY"
                  theme="transparent"
                  border="gray"
                  className="mt-2"
                  maxLength={3}
                />
              </div>
              <div>
                <label htmlFor="cvv" className="text-xl">
                  CVV
                </label>
                <Input
                  id="cvv"
                  type="number"
                  placeholder="123"
                  theme="transparent"
                  border="gray"
                  className="mt-2"
                  maxLength={3}
                />
              </div>

              <div>
                <Image
                  src={"/images/ccv-help 1.png"}
                  alt="CVV Help"
                  width={150}
                  height={150}
                />
                <div className="mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={handleCheckboxChange}
                      className="h-5 w-5 text-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                    <Text font={"medium"} size={"xl"} color={"gray"}>
                      Save card details
                    </Text>
                  </label>
                </div>
              </div>
              <div></div>
              <div>
                <Button>Add Card</Button>
              </div>
            </form>
          </div>
        ) : selectedPayment === "bank-card" ? (
          <div className="mt-8 w-full overflow-x-hidden rounded-xl bg-bgPrimary p-4">
            <Text font={"bold"} size={"2xl"}>
              Bank Card
            </Text>
            <Text font={"medium"} size={"xl"} className="mt-2">
              The amount required to pay for the bus subscription is 400 MAD
            </Text>
            <RadioGroup.Root
              className="my-4 flex space-x-4"
              value={selectedVisa} // Bind the value to the state
              onValueChange={handleVisaChange} // Update the state when a new option is selected
            >
              {visaCards.map(({ visaNumber }) => (
                <RadioGroup.Item
                  key={visaNumber}
                  value={visaNumber}
                  className="group flex h-20 w-1/4 flex-col justify-center rounded-lg border-2 border-borderPrimary text-center text-textSecondary transition hover:border-primary hover:text-primary focus-visible:ring focus-visible:ring-blue-200 focus-visible:ring-opacity-75 data-[state=checked]:border-primary data-[state=checked]:text-primary"
                  id={visaNumber}
                >
                  <div className="flex w-full justify-between px-4">
                    <div>
                      <Image
                        src={"/images/Visa.png"}
                        alt="Visa"
                        width={50}
                        height={50}
                      />
                    </div>
                    <div>
                      <Text font={"medium"} color={"gray"}>
                        {"**** **** **** " + visaNumber.slice(-4)}
                      </Text>

                      <Text color={"gray"} className="mt-2">
                        Visa - remove Visa
                      </Text>
                    </div>
                    <div className="relative h-6 w-6 rounded-full border-2 border-borderPrimary group-data-[state=checked]:border-primary">
                      <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 border-bgPrimary bg-bgPrimary group-data-[state=checked]:bg-primary"></div>
                    </div>
                  </div>
                </RadioGroup.Item>
              ))}
              <div className="w-1/8 mt-4">
                <Button theme="outline" onClick={handleAddCardClick}>
                  + Add New Card
                </Button>
              </div>
            </RadioGroup.Root>
            <div className="w-1/5">
              <label htmlFor="cvv" className="text-xl">
                CVV
              </label>
              <Input
                id="cvv"
                type="number"
                placeholder="123"
                theme="transparent"
                border="gray"
                className="mt-2"
                maxLength={3}
              />
            </div>
            <div className="mt-4 w-1/4">
              <Button>Pay 400 MAD</Button>
            </div>
          </div>
        ) : selectedPayment === "wallet" ? (
          <div className="mt-8 w-full overflow-x-hidden rounded-xl bg-bgPrimary p-4">
            <div className="border-b border-borderPrimary pb-8">
              <Text font={"bold"} size={"2xl"}>
                Wallet
              </Text>
              <Text font={"medium"} size={"xl"} className="mt-2">
                The amount required to pay for the bus subscription is 400 MAD
              </Text>
              <RadioGroup.Root
                className="my-4 flex space-x-4"
                value={selectedVisa} // Bind the value to the state
                onValueChange={handleVisaChange} // Update the state when a new option is selected
              >
                {wallets.map(({ name, src }) => (
                  <RadioGroup.Item
                    key={name}
                    value={name}
                    className="group flex h-20 w-1/4 flex-col justify-center rounded-lg border-2 border-borderPrimary text-center text-textSecondary transition hover:border-primary hover:text-primary focus-visible:ring focus-visible:ring-blue-200 focus-visible:ring-opacity-75 data-[state=checked]:border-primary data-[state=checked]:text-primary"
                    id={name}
                  >
                    <div className="flex w-full justify-between px-4">
                      <div className="flex gap-4">
                        <Image src={src} alt="Visa" width={50} height={50} />
                        <div>
                          <Text font={"medium"} size={"xl"}>
                            {name}
                          </Text>
                        </div>
                      </div>
                      <div className="relative h-6 w-6 rounded-full border-2 border-borderPrimary group-data-[state=checked]:border-primary">
                        <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 border-bgPrimary bg-bgPrimary group-data-[state=checked]:bg-primary"></div>
                      </div>
                    </div>
                  </RadioGroup.Item>
                ))}
              </RadioGroup.Root>
              <form className="mt-8 grid w-2/3 grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <label htmlFor="phoneNumber" className="text-xl">
                    Phone Number
                  </label>
                  <Input
                    id="phoneNumber"
                    type="number"
                    placeholder="01012345678"
                    theme="transparent"
                    border="gray"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="text-xl">
                    Enter the amount
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="00.00 MAD"
                    theme="transparent"
                    border="gray"
                    className="mt-2"
                  />
                </div>
              </form>
            </div>
            <div className="my-4">
              <Text font={"medium"} size={"xl"} className="mb-4">
                Vodafone Cash fees : 1.5%
              </Text>
              <Text font={"medium"} size={"xl"}>
                Estimate the amount : 0.00 MAD
              </Text>
            </div>
            <div className="mt-4 w-1/4">
              <Button>Continue</Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 w-full overflow-x-hidden rounded-xl bg-bgPrimary p-4">
            <Text font={"bold"} size={"2xl"}>
              Bank deposit
            </Text>
            <Text font={"medium"} size={"xl"} className="mt-4">
              Visit the nearest CIB branch and make a deposit using the
              following details, then confirm the transfer on the Edu AI app.
            </Text>
            <form className="mt-8 grid w-2/3 grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <label htmlFor="bankName" className="text-xl">
                  Bank name
                </label>
                <Input
                  id="phoneNumber"
                  placeholder="Bank Name"
                  theme="transparent"
                  border="gray"
                  className="mt-2"
                />
              </div>
              <div>
                <label htmlFor="beneficiaryName" className="text-xl">
                  Beneficiary name
                </label>
                <Input
                  id="beneficiaryName"
                  placeholder="Beneficiary name"
                  theme="transparent"
                  border="gray"
                  className="mt-2"
                />
              </div>
              <div>
                <label htmlFor="beneficiaryAddress" className="text-xl">
                  Beneficiary address
                </label>
                <Input
                  id="beneficiaryAddress"
                  placeholder="Beneficiary address"
                  theme="transparent"
                  border="gray"
                  className="mt-2"
                />
              </div>
              <div>
                <label htmlFor="beneficiaryAccountNumber" className="text-xl">
                  Beneficiary account number
                </label>
                <Input
                  id="beneficiaryAccountNumber"
                  placeholder="123456789098"
                  theme="transparent"
                  border="gray"
                  className="mt-2"
                />
              </div>
            </form>
            <Text font={"medium"} size={"xl"} color={"error"} className="mt-8">
              Please keep a photo of your receipt to confirm your deposit.
            </Text>
            <div className="mt-4 w-1/4">
              <Button>Confirm</Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}

export default Payment;
