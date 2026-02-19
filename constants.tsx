
import React from 'react';
import { Brain, Zap, Target, BarChart3, TrendingUp, Mic, Headphones } from 'lucide-react';
import { SyllabusStructure } from './types';

export const SYLLABUS: SyllabusStructure = {
  "Mathematics": {
    "Real Number": [
      "Prime Factorization (H.C.F, L.C.M.)",
      "LCM and formula {LCM(a,b) x H.C.F(a,b) = a x b}",
      "Irrational Numbers/Rational Numbers"
    ],
    "Polynomials": ["Basic Concepts of Polynomials"],
    "Pair of Linear Equations": [
      "Graphical Solution (Consistency / Inconsistency)",
      "Algebraic Methods to Solve Pair of Linear Equations",
      "Equations reducible to Linear Equations"
    ],
    "Quadratic Equations": [
      "Roots of the equations",
      "Relation between roots and coefficients",
      "Nature of the roots and discriminant"
    ],
    "Arithmetic Progressions": ["AP Sequence and Series Concepts"],
    "Triangles": [
      "Basic Proportionality Theorem",
      "Similar Triangles [AA, SSS, SAS]"
    ],
    "Co-ordinate Geometry": [
      "Co-ordinates and Quadrants",
      "Distance Between Two Points",
      "Section Formula and Mid-Point"
    ],
    "Introduction to Trigonometry": [
      "Trigonometric Ratios (Complementary angles & Values)",
      "Trigonometric Identities"
    ],
    "Some Applications of Trigonometry": ["Heights and Distances"],
    "Circles": ["Tangents to a Circle"],
    "Areas Related to Circles": ["Sector and Segment Area"],
    "Surface Area and Volumes": [
      "Area and Volume of Cylinder",
      "Area and Volume of Cone",
      "Area and Volume of Frustum",
      "Area and Volume of Sphere",
      "Area and Volume of Hemisphere"
    ],
    "Statistics": ["Mean, Median, and Mode of Grouped Data"],
    "Probability": [
      "Empirical Probability",
      "Theoretical Probability"
    ]
  },
  "Science": {
    "Chemical Reactions and Equations": [
      "Chemical Reactions and Equations",
      "Types of Chemical Reactions - Corrosion and Rancidity"
    ],
    "Acids, Bases and Salts": [
      "Acids, Bases and Salts",
      "Salts, Their Properties and Uses"
    ],
    "Metals and Non-metals": [
      "Properties of Metals and Non-metals",
      "Ionic compounds, metallurgy and corrosion"
    ],
    "Life Processes": [
      "Nutrition",
      "Respiration",
      "Circulation and Transportation",
      "Excretion"
    ],
    "Control and Coordination": [
      "Tropic Movements and Plant Hormones",
      "Control and Co-ordination in Animals"
    ],
    "Electricity": [
      "Electric Current",
      "Resistance (Series, Parallel), Power and Heating"
    ],
    "Magnetic Effects of Electric Current": [
      "Magnetic Effects of Electric Current"
    ],
    "Our Environment": [
      "Ecosystem and Food Chain",
      "Biodegradability and Global Warming"
    ],
    "Carbon and its Compounds": [
      "Carbon Properties, Homologous Series, IUPAC",
      "Carbon Compounds, Soap and Detergents"
    ],
    "How Do Organisms Reproduce?": [
      "Reproduction Basics, Asexual, Vegetative",
      "Sexual Reproduction in Plants",
      "Reproduction in Human Beings"
    ],
    "Heredity and Evolution": [
      "Heredity and Mendel's Contribution"
    ],
    "Light - Reflection and Refraction": [
      "Reflection, Spherical Mirrors",
      "Refraction, Lenses, Power of Lens"
    ],
    "The Human Eye and the Colourful World": [
      "Structure of Eye and Eye Defects",
      "Dispersion"
    ]
  }
};

export const ICONS = {
  Brain: <Brain className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Chart: <BarChart3 className="w-5 h-5" />,
  Trend: <TrendingUp className="w-5 h-5" />,
  Mic: <Mic className="w-5 h-5" />,
  Audio: <Headphones className="w-5 h-5" />
};
