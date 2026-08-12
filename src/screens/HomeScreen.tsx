import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { AuthController } from '../controllers/AuthController';
import { User } from '../models/User';

interface HomeScreenProps {
  onLogout: () => void;
}

export default function HomeScreen({ onLogout }: HomeScreenProps) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthController.getCurrentUser().then((current) => {
      setUser(current);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await AuthController.logout();
    onLogout();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.accentPrimary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundPrimary} />

      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="book" size={40} color={Colors.accentPrimary} />
        </View>
        <Text style={styles.welcome}>¡Hola, {user ? user.name : 'Lector'}!</Text>
        <Text style={styles.subtitle}>
          Tu sesión está activa en MangaTools
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Ionicons name="person-circle-outline" size={22} color={Colors.accentSecondary} />
          <Text style={styles.cardLabel}>Usuario</Text>
          <Text style={styles.cardValue}>{user ? user.name : '—'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.cardRow}>
          <Ionicons name="mail-outline" size={22} color={Colors.accentSecondary} />
          <Text style={styles.cardLabel}>Correo</Text>
          <Text style={styles.cardValue}>{user ? user.email : '—'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.textPrimary} />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  welcome: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cardValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  divider: {
    height: 1.5,
    backgroundColor: Colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surfacePrimary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
  },
  logoutButtonText: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
});
