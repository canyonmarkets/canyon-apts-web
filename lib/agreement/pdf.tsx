// Renders the final (signed or preview) rental agreement PDF with current
// Canyon branding. Used server-side only (route handlers).
import React from 'react';
import path from 'node:path';
import fs from 'node:fs';
import { Document, Page, Text, View, Image, StyleSheet, Font, renderToBuffer } from '@react-pdf/renderer';
import {
  AGREEMENT_TITLE, INTRO_PARAGRAPHS, OCCUPANCY_PERIOD_TEXT, SECTIONS, END_MARK,
  SPECIAL_TERMS_BULLETS, SIGNING_STATEMENT, type AgreementData,
} from './content';

const BRAND = '#C94B0C';
const DARK = '#1F2937';
const GRAY = '#4B5563';

const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NokianvirallinenkirjasinREGULAR.ttf');
const logoPath = path.join(process.cwd(), 'public', 'Canyon_Logo-removebg-preview.png');
try { Font.register({ family: 'CanyonDisplay', src: fontPath }); } catch { /* already registered */ }
try { Font.register({ family: 'Script', src: path.join(process.cwd(), 'public', 'fonts', 'GreatVibes-Regular.ttf') }); } catch { /* already registered */ }
// Load the logo as raw bytes — file-path strings render inconsistently on Windows.
let logoSrc: Buffer | null = null;
try { logoSrc = fs.readFileSync(logoPath); } catch { /* renders text-only if missing */ }

const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 44, paddingHorizontal: 44, fontSize: 8.6, fontFamily: 'Helvetica', color: DARK, lineHeight: 1.45 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, borderBottomWidth: 2, borderBottomColor: DARK, paddingBottom: 6 },
  logo: { width: 46, height: 30, objectFit: 'contain' },
  wordmark: { fontFamily: 'CanyonDisplay', fontSize: 14, color: DARK, letterSpacing: 2, textTransform: 'uppercase', width: 110 },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 11.5, flex: 1, textAlign: 'right' },
  label: { color: BRAND, fontFamily: 'Helvetica-Bold' },
  fieldRow: { flexDirection: 'row', marginTop: 5 },
  fieldVal: { fontFamily: 'Helvetica-Bold' },
  hr: { borderBottomWidth: 2, borderBottomColor: GRAY, marginVertical: 8 },
  moneyRow: { flexDirection: 'row', marginTop: 4 },
  para: { marginTop: 7 },
  sectionHead: { color: BRAND, fontFamily: 'Helvetica-Bold', textDecoration: 'underline', marginTop: 10, marginBottom: 2, fontSize: 9.4 },
  clause: { marginTop: 5 },
  sub: { marginTop: 3, marginLeft: 12 },
  bullet: { flexDirection: 'row', marginTop: 6 },
  specialBox: { backgroundColor: '#F5F4F0', padding: 12, borderRadius: 4, marginTop: 6 },
  narrative: { marginTop: 8, padding: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 3 },
  sigBlock: { marginTop: 14 },
  sigImg: { width: 150, height: 44, objectFit: 'contain' },
  sigLine: { flexDirection: 'row', alignItems: 'flex-end', gap: 24, marginTop: 10 },
  footer: { position: 'absolute', bottom: 20, right: 44, flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerLogo: { width: 26, height: 16, objectFit: 'contain' },
  pageNum: { position: 'absolute', bottom: 20, left: 44, color: GRAY, fontSize: 7.5 },
  auditRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB', paddingVertical: 6 },
});

export interface SignatureEntry { guest: string; nameTyped: string; image: string | null; at: string; ip: string; }
export interface AuditEvent { type: string; at: string; ip?: string; name?: string; }

function Header() {
  return (
    <View style={s.headerRow} fixed>
      {logoSrc ? (
        /* eslint-disable-next-line jsx-a11y/alt-text */
        <Image style={s.logo} src={logoSrc} />
      ) : null}
      <Text style={s.wordmark}>Canyon</Text>
      <Text style={s.title}>{AGREEMENT_TITLE}</Text>
    </View>
  );
}

function Footer() {
  return (
    <>
      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      <View style={s.footer} fixed>
        {logoSrc ? (
          /* eslint-disable-next-line jsx-a11y/alt-text */
          <Image style={s.footerLogo} src={logoSrc} />
        ) : null}
        <Text style={{ fontFamily: 'CanyonDisplay', fontSize: 8, color: GRAY }}>CANYON</Text>
      </View>
    </>
  );
}

function fmtStamp(iso: string) {
  return new Date(iso).toLocaleString('en-US', { timeZone: 'America/Phoenix', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' MST';
}

export function AgreementPDF({ data, signatures, events }: { data: AgreementData; signatures: SignatureEntry[]; events: AuditEvent[] }) {
  const money = (n: number) => '$ ' + Number(n || 0).toLocaleString();
  return (
    <Document title={`Rental Agreement — ${data.guests[0]?.name ?? ''}`}>
      {/* ── Page 1: parties + terms + money ── */}
      <Page size="LETTER" style={s.page}>
        <Header />
        <View style={s.fieldRow}><Text style={s.label}>Address:  </Text><Text style={s.fieldVal}>{data.address}</Text></View>
        {data.guests.map((g, i) => (
          <View key={i}>
            <View style={s.fieldRow}><Text style={s.label}>Guest:  </Text><Text style={s.fieldVal}>{g.name}</Text></View>
            <View style={s.fieldRow}>
              <Text style={s.label}>Email Address:  </Text><Text>{g.email || '—'}</Text>
              <Text style={[s.label, { marginLeft: 30 }]}>Mobile Phone:  </Text><Text>{g.phone || '—'}</Text>
            </View>
          </View>
        ))}
        {data.children.map((c, i) => (
          <View key={i} style={s.fieldRow}>
            <Text style={s.label}>Child Name:  </Text><Text>{c.name}</Text>
            <Text style={[s.label, { marginLeft: 30 }]}>Child Age:  </Text><Text>{c.age}</Text>
          </View>
        ))}
        <View style={s.fieldRow}><Text style={s.label}>Maximum Occupancy (Including Children):  </Text><Text style={s.fieldVal}>{data.maxOccupancy}</Text></View>
        <View style={s.hr} />
        <View style={s.fieldRow}>
          <Text style={s.label}>Occupancy:   Check-In Date:  </Text><Text style={s.fieldVal}>{data.checkIn}</Text>
          <Text style={[s.label, { marginLeft: 40 }]}>Check-Out Date:  </Text><Text style={s.fieldVal}>{data.checkOut}</Text>
        </View>
        <View style={s.fieldRow}><Text style={s.label}>Period:  </Text><Text style={{ flex: 1 }}>{OCCUPANCY_PERIOD_TEXT}</Text></View>
        <View style={s.hr} />
        {([
          ['Weekly Payment:', data.weeklyPayment],
          ['Security Deposit (Refundable):', data.securityDeposit],
          ['Cleaning Fee (Non-Refundable):', data.cleaningFee],
          ['Pet Fee (Non-Refundable):', data.petFee],
          ['TOTAL:', data.total],
          ['Total Due Upon Occupancy:', data.dueUponOccupancy],
          ['Balance Due:', data.balanceDue],
        ] as [string, number][]).map(([label, val]) => (
          <View key={label} style={s.moneyRow}>
            <Text style={[s.label, { width: 170 }]}>{label}</Text>
            <Text style={s.fieldVal}>{money(val)}</Text>
          </View>
        ))}
        <View style={s.hr} />
        {INTRO_PARAGRAPHS.map((p, i) => (
          <Text key={i} style={s.para}>
            {'label' in p && p.label ? <Text style={s.label}>{p.label} </Text> : null}
            {p.text}
          </Text>
        ))}
        <Footer />
      </Page>

      {/* ── The clauses ── */}
      <Page size="LETTER" style={s.page}>
        <Header />
        {SECTIONS.map(section => (
          <View key={section.heading}>
            <Text style={s.sectionHead}>{section.heading}</Text>
            {section.clauses.map((c, ci) => (
              <View key={ci} style={s.clause} wrap>
                <Text>
                  {c.n ? <Text style={{ fontFamily: 'Helvetica-Bold' }}>{c.n}. </Text> : null}
                  {c.title ? <Text style={s.label}>{c.title} </Text> : null}
                  {c.body}
                </Text>
                {(c.subs ?? []).map((sub, si) => (
                  <Text key={si} style={s.sub}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>{sub.n}. </Text>
                    {sub.title ? <Text style={s.label}>{sub.title} </Text> : null}
                    {sub.body}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ))}
        <Text style={[s.para, { textAlign: 'center', color: GRAY, fontFamily: 'Helvetica-Bold', marginTop: 14 }]}>{END_MARK}</Text>
        <Footer />
      </Page>

      {/* ── Special terms + signatures ── */}
      <Page size="LETTER" style={s.page}>
        <Header />
        <View style={s.specialBox}>
          <Text style={{ color: BRAND, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 4 }}>SPECIAL TERMS</Text>
          {SPECIAL_TERMS_BULLETS.map((b, i) => (
            <View key={i} style={s.bullet}>
              <Text style={{ width: 12 }}>•</Text>
              <Text style={{ flex: 1 }}>{b}</Text>
            </View>
          ))}
          {data.specialTerms ? (
            <View style={s.narrative}>
              {data.specialTerms.split('\n').map((line, i) => <Text key={i} style={{ marginTop: i === 0 ? 0 : 4 }}>{line}</Text>)}
            </View>
          ) : null}
        </View>
        <View style={s.hr} />
        <Text>{SIGNING_STATEMENT}</Text>
        <View style={s.hr} />

        <View style={s.sigBlock}>
          <Text><Text style={s.label}>CANYON ADVISORS, INC. REPRESENTATIVE:  </Text><Text style={{ fontFamily: 'Script', fontSize: 16 }}>{data.repName}</Text></Text>
          <View style={s.sigLine}>
            <Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>Canyon Advisors, Inc Name:  </Text>{data.repName}</Text>
            <Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>Date:  </Text>{data.repDate}</Text>
          </View>
        </View>

        {data.guests.map((g, i) => {
          const sig = signatures.find(x => x.guest === g.name);
          return (
            <View key={i} style={s.sigBlock} wrap={false}>
              <Text style={s.label}>GUEST:</Text>
              {sig?.image ? (
                /* eslint-disable-next-line jsx-a11y/alt-text */
                <Image style={s.sigImg} src={sig.image} />
              ) : (
                <Text style={{ color: GRAY, marginTop: 6 }}>(not signed)</Text>
              )}
              <View style={s.sigLine}>
                <Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>Guest Name:  </Text>{sig?.nameTyped || g.name}</Text>
                <Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>Date:  </Text>{sig ? fmtStamp(sig.at) : ''}</Text>
              </View>
            </View>
          );
        })}
        <Footer />
      </Page>

      {/* ── Audit trail ── */}
      <Page size="LETTER" style={s.page}>
        <Header />
        <Text style={[s.sectionHead, { fontSize: 12, textDecoration: 'none' }]}>Signature Audit Trail</Text>
        <Text style={{ color: GRAY, marginBottom: 8 }}>Recorded automatically by the Canyon Apartments back office (canyon-apts.com).</Text>
        {events.map((e, i) => (
          <View key={i} style={s.auditRow}>
            <Text style={{ fontFamily: 'Helvetica-Bold', width: 120 }}>
              {e.type === 'sent' ? 'Agreement Sent' : e.type === 'viewed' ? 'Agreement Viewed' : e.type === 'signed' ? 'Agreement Signed' : e.type === 'id_uploaded' ? 'Photo ID Uploaded' : e.type === 'selfie_uploaded' ? 'Selfie Uploaded' : e.type}
            </Text>
            <Text style={{ flex: 1 }}>{e.name ?? ''}{e.ip ? `  ·  IP ${e.ip}` : ''}</Text>
            <Text style={{ color: GRAY }}>{fmtStamp(e.at)}</Text>
          </View>
        ))}
        <Footer />
      </Page>
    </Document>
  );
}

export async function renderAgreementPDF(data: AgreementData, signatures: SignatureEntry[], events: AuditEvent[]): Promise<Buffer> {
  return renderToBuffer(<AgreementPDF data={data} signatures={signatures} events={events} />);
}
