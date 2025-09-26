// transactionsTable.js
import { LightningElement, track } from 'lwc';

export default class TransactionsTable extends LightningElement {
    @track transactions = [
        { id: 1, ref: "Ref-1758630355148", type: "Visa", card: "XXXX1111", amount: "₹2,500.00", status: "Successful", date: "9/23/2025" },
        { id: 2, ref: "Ref-1758630691778", type: "Discover", card: "XXXX8018", amount: "₹123.00", status: "Successful", date: "9/23/2025" },
        { id: 3, ref: "Ref-1758630716703", type: "Discover", card: "XXXX0067", amount: "₹123.00", status: "Successful", date: "9/23/2025" },
        { id: 4, ref: "Ref-1758630731350", type: "JCB", card: "XXXX0017", amount: "₹123.00", status: "Successful", date: "9/23/2025" },
        { id: 5, ref: "Ref-1758630756395", type: "MasterCard", card: "XXXX0015", amount: "₹123.00", status: "Successful", date: "9/23/2025" },
        { id: 6, ref: "Ref-1758640712661", type: "Visa", card: "XXXX1111", amount: "₹2,500.00", status: "Successful", date: "9/23/2025" },
        { id: 7, ref: "Ref-1758642986259", type: "Visa", card: "XXXX1111", amount: "₹230.00", status: "Successful", date: "9/23/2025" },
        { id: 8, ref: "Ref-1758643498973", type: "Visa", card: "XXXX1111", amount: "₹230.00", status: "Successful", date: "9/23/2025" },
        { id: 9, ref: "Ref-1758644166721", type: "Visa", card: "XXXX1111", amount: "₹600.00", status: "Successful", date: "9/23/2025" },
        { id: 10, ref: "Ref-175872170563", type: "Visa", card: "XXXX1111", amount: "₹340.00", status: "Successful", date: "9/24/2025" },
        { id: 11, ref: "Ref-175726387757", type: "MasterCard", card: "XXXX0015", amount: "₹800.00", status: "Successful", date: "9/24/2025" },
        { id: 12, ref: "Ref-1758726534275", type: "MasterCard", card: "XXXX0015", amount: "₹650.00", status: "Successful", date: "9/24/2025" },
        { id: 13, ref: "Ref-1758727913060", type: "Visa", card: "XXXX1111", amount: "₹1,000.00", status: "Successful", date: "9/24/2025" }
    ];
}
