from django.core.management.base import BaseCommand
from core.models import Subject, Unit, Topic, PYQQuestion


class Command(BaseCommand):
    help = 'Seed the database with Computer Networks syllabus data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Computer Networks syllabus...')
        
        # Create Subject
        subject, created = Subject.objects.get_or_create(
            name='Computer Networks',
            defaults={
                'code': 'CS305',
                'description': 'Study of computer networking concepts, protocols, and architecture for B.Tech 3rd semester'
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created subject: {subject.name}'))
        else:
            self.stdout.write(f'Subject already exists: {subject.name}')
        
        # Define syllabus structure
        syllabus = {
            'Unit 1: Introduction to Computer Networks': [
                'Introduction to Computer Networks',
                'Types of Networks (LAN, MAN, WAN)',
                'Network Topologies',
                'Network Architecture and Protocols',
                'OSI Reference Model',
                'TCP/IP Reference Model',
                'Comparison of OSI and TCP/IP Models',
            ],
            'Unit 2: Physical Layer': [
                'Data Communication Fundamentals',
                'Transmission Media (Guided and Unguided)',
                'Multiplexing Techniques (FDM, TDM, WDM)',
                'Switching Techniques (Circuit, Packet, Message)',
                'Transmission Modes (Simplex, Half-duplex, Full-duplex)',
                'Digital and Analog Signals',
                'Data Encoding Techniques',
            ],
            'Unit 3: Data Link Layer': [
                'Data Link Layer Design Issues',
                'Framing Techniques',
                'Error Detection Methods (Parity, CRC, Checksum)',
                'Error Correction (Hamming Code)',
                'Flow Control Protocols',
                'Stop and Wait Protocol',
                'Sliding Window Protocol',
                'Go-Back-N ARQ',
                'Selective Repeat ARQ',
                'HDLC Protocol',
                'PPP Protocol',
            ],
            'Unit 4: Medium Access Control (MAC)': [
                'Multiple Access Protocols',
                'ALOHA (Pure and Slotted)',
                'CSMA Protocols',
                'CSMA/CD (Ethernet)',
                'CSMA/CA (WiFi)',
                'Token Ring',
                'Token Bus',
                'Ethernet Standards',
                'IEEE 802.3',
                'IEEE 802.11 (WiFi)',
            ],
            'Unit 5: Network Layer': [
                'Network Layer Design Issues',
                'Routing Algorithms',
                'Distance Vector Routing',
                'Link State Routing',
                'Dijkstra Algorithm',
                'Bellman-Ford Algorithm',
                'IP Addressing and Subnetting',
                'IPv4 Header Format',
                'Classful and Classless Addressing',
                'CIDR',
                'NAT (Network Address Translation)',
                'ICMP Protocol',
                'ARP and RARP',
                'IPv6 Introduction',
            ],
            'Unit 6: Transport Layer': [
                'Transport Layer Services',
                'UDP Protocol',
                'TCP Protocol',
                'TCP 3-Way Handshake',
                'TCP Connection Management',
                'TCP Flow Control',
                'TCP Congestion Control',
                'Slow Start and Congestion Avoidance',
                'Port Numbers and Sockets',
                'Comparison of TCP and UDP',
            ],
            'Unit 7: Application Layer': [
                'Application Layer Protocols',
                'DNS (Domain Name System)',
                'HTTP and HTTPS',
                'FTP (File Transfer Protocol)',
                'SMTP (Simple Mail Transfer Protocol)',
                'POP3 and IMAP',
                'DHCP Protocol',
                'Telnet and SSH',
                'SNMP (Simple Network Management Protocol)',
            ],
        }
        
        # Create Units and Topics
        for unit_num, (unit_name, topics) in enumerate(syllabus.items(), 1):
            unit, created = Unit.objects.get_or_create(
                subject=subject,
                unit_number=unit_num,
                defaults={'name': unit_name.split(': ')[1] if ': ' in unit_name else unit_name}
            )
            
            if created:
                self.stdout.write(f'  Created unit: {unit.name}')
            
            for topic_order, topic_name in enumerate(topics, 1):
                topic, created = Topic.objects.get_or_create(
                    unit=unit,
                    name=topic_name,
                    defaults={'order': topic_order}
                )
                if created:
                    self.stdout.write(f'    Created topic: {topic.name}')
        
        # Add sample PYQs
        sample_pyqs = [
            {'year': 2023, 'exam_type': 'endsem', 'question': 'Explain the OSI Reference Model with all seven layers and their functions.', 'marks': 10},
            {'year': 2023, 'exam_type': 'endsem', 'question': 'What is TCP 3-way handshake? Explain with diagram.', 'marks': 5},
            {'year': 2023, 'exam_type': 'midsem', 'question': 'Compare and contrast TCP and UDP protocols.', 'marks': 5},
            {'year': 2023, 'exam_type': 'endsem', 'question': 'Explain CSMA/CD protocol with collision detection mechanism.', 'marks': 10},
            {'year': 2022, 'exam_type': 'endsem', 'question': 'Describe the Distance Vector Routing algorithm.', 'marks': 10},
            {'year': 2022, 'exam_type': 'endsem', 'question': 'What is subnetting? Given IP 192.168.1.0/24, divide into 4 subnets.', 'marks': 10},
            {'year': 2022, 'exam_type': 'midsem', 'question': 'Explain different types of transmission media.', 'marks': 5},
            {'year': 2022, 'exam_type': 'endsem', 'question': 'Describe the working of DNS.', 'marks': 5},
            {'year': 2021, 'exam_type': 'endsem', 'question': 'Explain Sliding Window Protocol with Go-Back-N ARQ.', 'marks': 10},
            {'year': 2021, 'exam_type': 'endsem', 'question': 'What is congestion control? Explain TCP congestion control mechanisms.', 'marks': 10},
            {'year': 2021, 'exam_type': 'midsem', 'question': 'Differentiate between circuit switching and packet switching.', 'marks': 5},
            {'year': 2021, 'exam_type': 'endsem', 'question': 'Explain the HTTP protocol and its methods.', 'marks': 5},
            {'year': 2020, 'exam_type': 'endsem', 'question': 'Describe IPv4 header format in detail.', 'marks': 10},
            {'year': 2020, 'exam_type': 'endsem', 'question': 'Explain ALOHA protocol (Pure and Slotted).', 'marks': 10},
            {'year': 2020, 'exam_type': 'midsem', 'question': 'What is CRC? Explain with example.', 'marks': 5},
        ]
        
        for pyq_data in sample_pyqs:
            pyq, created = PYQQuestion.objects.get_or_create(
                subject=subject,
                year=pyq_data['year'],
                question_text=pyq_data['question'],
                defaults={
                    'exam_type': pyq_data['exam_type'],
                    'marks': pyq_data['marks']
                }
            )
            if created:
                self.stdout.write(f'  Created PYQ: {pyq.question_text[:50]}...')
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded Computer Networks data!'))
        
        # Print summary
        total_units = Unit.objects.filter(subject=subject).count()
        total_topics = Topic.objects.filter(unit__subject=subject).count()
        total_pyqs = PYQQuestion.objects.filter(subject=subject).count()
        
        self.stdout.write(f'\nSummary:')
        self.stdout.write(f'  Units: {total_units}')
        self.stdout.write(f'  Topics: {total_topics}')
        self.stdout.write(f'  PYQs: {total_pyqs}')
