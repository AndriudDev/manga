import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onLogin: () => void;
}

export default function WelcomeScreen({ onLogin }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundPrimary} />

      {/* Composición gráfica manga */}
      <View style={styles.heroSection}>
        {/* Círculo decorativo de fondo */}
        <View style={styles.iconBackground}>
          <View style={styles.iconRing} />
        </View>

        {/* Ícono principal — libro abierto / manga */}
        <View style={styles.iconContainer}>
          <Ionicons name="book" size={80} color={Colors.accentPrimary} />
        </View>

        {/* Estrellas decorativas */}
        <View style={[styles.star, styles.starTopRight]}>
          <Ionicons name="star" size={16} color={Colors.accentSecondary} />
        </View>
        <View style={[styles.star, styles.starBottomLeft]}>
          <Ionicons name="star" size={12} color={Colors.accentTertiary} />
        </View>
        <View style={[styles.star, styles.starTopLeft]}>
          <Ionicons name="sparkles" size={14} color={Colors.accentPrimary} />
        </View>
      </View>

      {/* Título y eslogan */}
      <View style={styles.textSection}>
        <Text style={styles.title}>
          Manga<Text style={styles.titleAccent}>Tools</Text>
        </Text>
        <Text style={styles.subtitle}>
          Tu biblioteca de manga y cómics en un solo lugar
        </Text>
        <Text style={styles.description}>
          Explora, colecciona y lee tus series favoritas con la mejor experiencia.
        </Text>
      </View>

      {/* Botón de Login */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.8}
          onPress={onLogin}
        >
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.footerText}>
          MangaTools © 2026
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },

  // === Hero / Composición gráfica ===
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    width: width * 0.7,
  },
  iconBackground: {
    position: 'absolute',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: Colors.surfacePrimary,
    backgroundColor: Colors.surfaceSecondary,
    position: 'absolute',
  },
  iconContainer: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Estrellas decorativas
  star: {
    position: 'absolute',
  },
  starTopRight: {
    top: 10,
    right: 30,
  },
  starBottomLeft: {
    bottom: 20,
    left: 25,
  },
  starTopLeft: {
    top: 30,
    left: 20,
  },

  // === Texto ===
  textSection: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  titleAccent: {
    color: Colors.accentPrimary,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
    maxWidth: 280,
  },

  // === Botón ===
  buttonSection: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    gap: 10,
    width: '100%',
  },
  loginButtonText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    opacity: 0.5,
  },
});
