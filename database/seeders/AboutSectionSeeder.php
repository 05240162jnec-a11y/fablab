<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AboutSection;
use App\Models\TeamMember;

class AboutSectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create About Sections
        $sections = [
            [
                'section_key' => 'who_we_are',
                'title' => 'JNEC Fab Lab?',
                'body' => "The JNEC Fab Lab is a digital fabrication laboratory equipped with advanced tools such as 3D printers, laser cutters, CNC machines, and electronics workstations.\n\nIt provides students, faculty, and innovators with a dedicated space to transform creative ideas into real prototypes — fostering a culture of hands-on learning, collaboration, and innovation.\n\nOpen to all members of the JNEC community, the Fab Lab bridges the gap between classroom theory and real-world engineering practice.",
                'image_path' => null,
                'order' => 1,
                'is_active' => true,
            ],
            [
                'section_key' => 'mission',
                'title' => 'Our Mission',
                'body' => 'To empower students and innovators by providing access to digital fabrication tools and enabling them to transform ideas into real-world solutions — bridging the gap between imagination and engineering reality.',
                'image_path' => null,
                'order' => 2,
                'is_active' => true,
            ],
            [
                'section_key' => 'vision',
                'title' => 'Our Vision',
                'body' => 'To create a collaborative innovation hub where creativity, technology, and entrepreneurship thrive — inspiring the next generation of engineers, designers, and makers in Bhutan and beyond.',
                'image_path' => null,
                'order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($sections as $section) {
            AboutSection::create($section);
        }

        // Create sample team members (optional - you can add your actual team later)
        $teamMembers = [
            [
                'name' => 'Pema Wangchug',
                'role' => 'Associate Director',
                'image_path' => null,
                'linkedin_url' => null,
                'facebook_url' => null,
                'twitter_url' => null,
                'order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Tshering Wangzom',
                'role' => 'Senior Analyst',
                'image_path' => null,
                'linkedin_url' => null,
                'facebook_url' => null,
                'twitter_url' => null,
                'order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($teamMembers as $member) {
            TeamMember::create($member);
        }
    }
}