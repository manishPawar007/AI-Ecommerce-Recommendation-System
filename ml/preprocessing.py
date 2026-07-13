import pandas as pd


def load_data():
    df = pd.read_excel(
        "../datasets/Online Retail.xlsx"
    )
    return df


def preprocess_data():

    df = load_data()

    # Remove missing descriptions
    df = df.dropna(
        subset=["Description"]
    )

    # Remove missing customers
    df = df.dropna(
        subset=["CustomerID"]
    )

    # Remove cancelled invoices
    df = df[
        ~df["InvoiceNo"]
        .astype(str)
        .str.startswith("C")
    ]

    # Remove negative quantity
    df = df[
        df["Quantity"] > 0
    ]

    # Revenue
    df["Revenue"] = (
        df["Quantity"]
        * df["UnitPrice"]
    )

    # Convert date
    df["InvoiceDate"] = pd.to_datetime(
        df["InvoiceDate"]
    )

    # Date Features
    df["Year"] = (
        df["InvoiceDate"]
        .dt.year
    )

    df["Month"] = (
        df["InvoiceDate"]
        .dt.month
    )

    df["Day"] = (
        df["InvoiceDate"]
        .dt.day
    )

    df["Hour"] = (
        df["InvoiceDate"]
        .dt.hour
    )

    return df


if __name__ == "__main__":

    df = preprocess_data()

    df.to_csv(
        "processed_data.csv",
        index=False
    )

    print(df.head())
    print()
    print("Data preprocessing completed.")