package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

func main() {
	http.Handle("/", http.FileServer(http.Dir(".")))
	http.HandleFunc("/gigs", func(writer http.ResponseWriter, request *http.Request) {
		html := "gigs"
		writer.Write([]byte(html))
	})

	log.Println("Server is running on :8081...")
	err := http.ListenAndServe(":8081", nil)
	if err != nil {
		log.Fatal(err)
	}
}

type Gig struct {
	place string
	date  time.Time
}

func getGigs() []Gig {
	gigs := []Gig{
		{"Pääsiäisjamit 2024 KLA", toDate("30.3.2024")},
		{"Bar 15 SJK", toDate("2.2.2024")},
		{"Bar Kilta KLA", toDate("1.2.2024")},
		{"Hard Rock House HKI", toDate("27.1.2024")},
		{"Bar Loose HKI", toDate("4.1.2024")},
		{"Playhouse Bar HKI", toDate("30.11.2023")},
		{"Hard Rock House HKI", toDate("12.10.2023")},
		{"Playhouse Bar HKI", toDate("4.10.2023")},
		{"Bar Loose HKI", toDate("10.5.2023")},
		{"Lepakkomies HKI", toDate("9.4.2023")},
		{"Humina Tila HKI", toDate("8.3.2023")},
		{"Musta Kissa HKI", toDate("8.10.2022")},
		{"Pääsiäisjamit 2022 KLA", toDate("16.4.2022")},
		{"Hard Rock House HKI", toDate("25.3.2022")},
		{"Hard Rock Cafe HKI", toDate("11.3.2022")},
		{"Musta Kissa HKI", toDate("10.12.2021")},
		{"West Coast Billiard KLA", toDate("26.8.2021")},
	}
	return gigs
}

func toDate(date string) time.Time {
	dateFormat := "02.01.2006"
	parsedDate, err := time.Parse(dateFormat, date)
	if err != nil {
		fmt.Println("Error parsing date", err)
	}
	return parsedDate
}
