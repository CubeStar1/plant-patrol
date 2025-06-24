import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
  Font,
} from "@react-email/components";
import * as React from "react";

interface Detection {
  names: string[];
  imageUrl: string | null;
}

interface DetectionAlertEmailProps {
  pestDetections?: Detection[];
  diseaseDetections?: Detection[];
}

export default function DetectionAlertEmail({
  pestDetections = [],
  diseaseDetections = [],
}: DetectionAlertEmailProps) {
  const appName = "PlantPatrol";
  const hasPestDetections = pestDetections.length > 0;
  const hasDiseaseDetections = diseaseDetections.length > 0;

  const chunk = (arr: Detection[], size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );

  const pestChunks = chunk(pestDetections, 2);
  const diseaseChunks = chunk(diseaseDetections, 2);

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{appName} - New Detections Alert</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>New Detections</Heading>
            <Text style={mainText}>
              A summary of recent pest and disease detections.
            </Text>
          </Section>

          {hasPestDetections && (
            <Section>
              <Heading as="h2" style={h2}>Pest Detections</Heading>
              {pestChunks.map((row, rowIndex) => (
                <Row key={`pest-row-${rowIndex}`}>
                  {row.map((pest, colIndex) => (
                    <Column key={`pest-${rowIndex}-${colIndex}`} style={gridItem} width="50%">
                      <Img src={pest.imageUrl || ""} style={image} />
                      <Text style={label}>{pest.names.join(', ')}</Text>
                    </Column>
                  ))}
                  {/* Add an empty column to keep the layout consistent for odd-numbered items */}
                  {row.length === 1 && <Column style={gridItem} width="50%" />}
                </Row>
              ))}
            </Section>
          )}

          {hasDiseaseDetections && (
            <Section style={{ marginTop: "20px" }}>
              <Heading as="h2" style={h2}>Disease Detections</Heading>
              {diseaseChunks.map((row, rowIndex) => (
                <Row key={`disease-row-${rowIndex}`}>
                  {row.map((disease, colIndex) => (
                    <Column key={`disease-${rowIndex}-${colIndex}`} style={gridItem} width="50%">
                      <Img src={disease.imageUrl || ""} style={image} />
                      <Text style={label}>{disease.names.join(', ')}</Text>
                    </Column>
                  ))}
                  {/* Add an empty column to keep the layout consistent for odd-numbered items */}
                  {row.length === 1 && <Column style={gridItem} width="50%" />}
                </Row>
              ))}
            </Section>
          )}

          <Hr style={hr} />
          <Text style={footerText}>
            You are receiving this because alerts are enabled in your {appName} account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f9fafb",
  color: "#1f2937",
  fontFamily: 'Inter, sans-serif',
};
const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: '600px',
};
const headerSection = {
  padding: '24px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  textAlign: 'center' as const,
};
const h1 = {
  color: "#059669",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 12px",
};
const mainText = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
};
const h2 = {
  color: "#059669",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "32px 0 16px",
  padding: '0 24px',
};
const gridItem = {
  padding: '12px',
  verticalAlign: 'top',
};
const image = {
  width: '100%',
  borderRadius: '8px',
  height: '240px',
};
const label = {
  textAlign: 'center' as const,
  marginTop: '8px',
  fontSize: '14px',
  color: '#374151',
};
const hr = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "40px 0",
};
const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0",
  textAlign: "center" as const,
};
