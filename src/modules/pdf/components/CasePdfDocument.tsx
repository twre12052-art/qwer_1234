"use client";

import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { fontStyle } from "../font";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    ...fontStyle,
    fontSize: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 10,
    padding: 10,
  },
  header: {
    fontSize: 12,
    marginBottom: 5,
    backgroundColor: "#f0f0f0",
    padding: 5,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 5,
  },
  label: {
    width: "30%",
    color: "#555",
  },
  value: {
    width: "70%",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
    fontSize: 8,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid", 
    borderWidth: 1, 
    borderRightWidth: 0, 
    borderBottomWidth: 0,
    marginTop: 10,
  }, 
  tableRow: { 
    margin: "auto", 
    flexDirection: "row",
  }, 
  tableCol: { 
    width: "25%", 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0,
    padding: 5,
  },
  tableColHeader: {
      backgroundColor: "#f0f0f0",
      fontWeight: "bold",
  },
  tableCell: { 
    margin: "auto", 
    marginTop: 5, 
    fontSize: 10,
  }
});

interface CasePdfProps {
    caseData: any;
    careLogs: any[];
    payment: any;
}

export const CasePdfDocument = ({ caseData, careLogs, payment }: CasePdfProps) => {
    const totalDays = careLogs.length; // Or calculate from dates
    
    return (
        <Document>
            {/* 1. 간병 계약서 & 간병인 확인서 (Page 1) */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>간병 용역 표준 계약서</Text>
                
                <View style={styles.section}>
                    <Text style={styles.header}>1. 기본 정보</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>환자 성명</Text>
                        <Text style={styles.value}>{caseData.patient_name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>간병인 성명</Text>
                        <Text style={styles.value}>{caseData.caregiver_name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>간병 기간</Text>
                        <Text style={styles.value}>{caseData.start_date} ~ {caseData.end_date_final || caseData.end_date_expected}</Text>
                    </View>
                     <View style={styles.row}>
                        <Text style={styles.label}>1일 간병비</Text>
                        <Text style={styles.value}>{caseData.daily_wage.toLocaleString()}원</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.header}>2. 주요 계약 조항</Text>
                    <Text style={{ marginBottom: 5 }}>제1조 (목적) 본 계약은 환자의 간병 및 요양을 위하여...</Text>
                    <Text>제2조 (성실의무) 간병인은 환자의 안위를 최우선으로 하여...</Text>
                    {/* ... more legal text ... */}
                </View>
                
                <View style={{ marginTop: 50, textAlign: 'center' }}>
                     <Text style={{ fontSize: 14, marginBottom: 20 }}>위와 같이 계약을 체결합니다.</Text>
                     <Text>계약일: {caseData.guardian_agreed_at?.split('T')[0] || "2024-01-01"}</Text>
                </View>

                <Text style={styles.footer}>
                    이 서류는 보험 청구용이며, 연말정산 의료비 공제용 영수증이 아닙니다.
                </Text>
            </Page>

            {/* 2. 간병일지 요약 (Page 2) */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>간병일지 요약</Text>
                <View style={styles.table}>
                     <View style={styles.tableRow}>
                        <View style={{...styles.tableCol, ...styles.tableColHeader, width: "20%"}}><Text style={styles.tableCell}>날짜</Text></View>
                        <View style={{...styles.tableCol, ...styles.tableColHeader, width: "80%"}}><Text style={styles.tableCell}>내용</Text></View>
                     </View>
                     {careLogs.map((log, i) => (
                         <View style={styles.tableRow} key={i}>
                             <View style={{...styles.tableCol, width: "20%"}}>
                                 <Text style={styles.tableCell}>{log.date}</Text>
                             </View>
                             <View style={{...styles.tableCol, width: "80%"}}>
                                 <Text style={styles.tableCell}>{log.content}</Text>
                             </View>
                         </View>
                     ))}
                </View>
                 <Text style={styles.footer}>
                    이 서류는 보험 청구용이며, 연말정산 의료비 공제용 영수증이 아닙니다.
                </Text>
            </Page>

             {/* 3. 간병인/소속/지급 확인서 (Page 3) */}
            <Page size="A4" style={styles.page}>
                 <View style={styles.section}>
                    <Text style={styles.title}>간병인 확인서</Text>
                    <Text style={{ marginBottom: 10 }}>
                        본인은 상기 기간 동안 환자 {caseData.patient_name}님을 성실히 간병하였음을 확인합니다.
                    </Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>간병인 성명</Text>
                        <Text style={styles.value}>{caseData.caregiver_name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>주민등록번호(앞자리)</Text>
                        <Text style={styles.value}>{caseData.caregiver_birth_date}</Text>
                    </View>
                 </View>

                 <View style={{ ...styles.section, marginTop: 20 }}>
                    <Text style={styles.title}>간병비 지급 확인서</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>총 지급액</Text>
                        <Text style={styles.value}>{payment?.total_amount?.toLocaleString()}원</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>지급일</Text>
                        <Text style={styles.value}>{payment?.paid_at?.split('T')[0]}</Text>
                    </View>
                     <Text style={{ marginTop: 10, textAlign: 'center' }}>
                        위 금액을 정히 영수(지급)하였음을 확인합니다.
                    </Text>
                 </View>

                 <View style={{ ...styles.section, marginTop: 20, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 20 }}>
                    <Text style={styles.title}>소속 확인서</Text>
                    <Text>본 간병인은 아래 협회/센터에 소속되어 있음을 확인합니다.</Text>
                    <View style={{ marginTop: 10, padding: 10, backgroundColor: '#f9f9f9' }}>
                        <Text>상호: 케어 서비스 플랫폼</Text>
                        <Text>사업자등록번호: 000-00-00000</Text>
                        <Text>대표자: 홍길동</Text>
                        <Text>주소: 서울특별시 강남구 ...</Text>
                    </View>
                 </View>

                 <Text style={styles.footer}>
                    이 서류는 보험 청구용이며, 연말정산 의료비 공제용 영수증이 아닙니다.
                </Text>
            </Page>
        </Document>
    );
};

